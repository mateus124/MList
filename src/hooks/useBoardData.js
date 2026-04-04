import { useEffect, useMemo, useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import useLocalStorage from './useLocalStorage';

const BOARD_STORAGE_KEY = 'mlist_boards_by_tab';

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const createEmptyBoard = (columns) => (
  Object.fromEntries(columns.map((columnId) => [columnId, []]))
);

const normalizeLink = (link) => ({
  id: link.id ?? createId('item'),
  label: String(link.label ?? '').trim(),
  href: String(link.href ?? '').trim(),
});

const normalizeCard = (card) => ({
  id: card.id ?? createId('card'),
  title: String(card.title ?? '').trim(),
  links: Array.isArray(card.links) ? card.links.map(normalizeLink) : [],
});

const normalizeBoard = (board, columns) => {
  const template = createEmptyBoard(columns);

  if (!board || typeof board !== 'object') {
    return template;
  }

  return columns.reduce((result, columnId) => {
    const cards = Array.isArray(board[columnId]) ? board[columnId] : [];
    result[columnId] = cards.map(normalizeCard);
    return result;
  }, template);
};

const getStorageEntries = async () => {
  const hasChromeStorage =
    typeof chrome !== 'undefined' &&
    chrome.storage &&
    chrome.storage.local;

  if (hasChromeStorage) {
    const allStored = await chrome.storage.local.get(null);
    return Object.entries(allStored);
  }

  return Object.keys(window.localStorage).map((key) => {
    const rawValue = window.localStorage.getItem(key);
    let parsed = rawValue;

    try {
      parsed = rawValue ? JSON.parse(rawValue) : rawValue;
    } catch {
      parsed = rawValue;
    }

    return [key, parsed];
  });
};

const loadLegacyBoard = async (activeTabId, columns) => {
  const entries = await getStorageEntries();
  const board = createEmptyBoard(columns);
  let foundAnyData = false;

  for (const columnId of columns) {
    const legacyColumnId = `${activeTabId}_${columnId}`;
    const cardsKey = `mlist_${legacyColumnId}_cards`;
    const cards = entries.find(([key]) => key === cardsKey)?.[1];

    if (!Array.isArray(cards) || cards.length === 0) {
      continue;
    }

    foundAnyData = true;
    board[columnId] = cards.map((card) => {
      const linksKey = `mlist_${legacyColumnId}_${card.id}_links`;
      const legacyLinks = entries.find(([key]) => key === linksKey)?.[1];

      return {
        id: card.id ?? createId('card'),
        title: String(card.title ?? '').trim(),
        links: Array.isArray(legacyLinks)
          ? legacyLinks.map((link) => ({
            id: createId('item'),
            label: String(link.label ?? '').trim(),
            href: String(link.href ?? '').trim(),
          }))
          : [],
      };
    });
  }

  return foundAnyData ? board : null;
};

const findCardLocation = (board, cardId) => {
  for (const [columnId, cards] of Object.entries(board)) {
    const cardIndex = cards.findIndex((card) => card.id === cardId);
    if (cardIndex !== -1) {
      return { columnId, cardIndex };
    }
  }

  return null;
};

const findItemLocation = (board, itemId) => {
  for (const [columnId, cards] of Object.entries(board)) {
    for (let cardIndex = 0; cardIndex < cards.length; cardIndex += 1) {
      const itemIndex = cards[cardIndex].links.findIndex((item) => item.id === itemId);
      if (itemIndex !== -1) {
        return { columnId, cardIndex, itemIndex };
      }
    }
  }

  return null;
};

const useBoardData = ({ activeTabId, columns }) => {
  const {
    data: boardsByTab,
    saveToStorage: saveBoardsByTab,
    isLoaded,
  } = useLocalStorage(BOARD_STORAGE_KEY, {});

  const boardsRef = useRef(boardsByTab);

  useEffect(() => {
    boardsRef.current = boardsByTab;
  }, [boardsByTab]);

  useEffect(() => {
    if (!isLoaded || !activeTabId) {
      return;
    }

    if (boardsRef.current?.[activeTabId]) {
      return;
    }

    let isCancelled = false;

    const initializeTabBoard = async () => {
      const migratedBoard = await loadLegacyBoard(activeTabId, columns);
      if (isCancelled) return;

      const nextBoards = {
        ...(boardsRef.current ?? {}),
        [activeTabId]: normalizeBoard(migratedBoard ?? createEmptyBoard(columns), columns),
      };

      boardsRef.current = nextBoards;
      await saveBoardsByTab(nextBoards);
    };

    initializeTabBoard();

    return () => {
      isCancelled = true;
    };
  }, [activeTabId, columns, isLoaded, saveBoardsByTab]);

  const activeBoard = useMemo(() => {
    if (!activeTabId) {
      return createEmptyBoard(columns);
    }

    return normalizeBoard(boardsByTab?.[activeTabId], columns);
  }, [activeTabId, boardsByTab, columns]);

  const saveActiveBoard = async (nextBoard) => {
    if (!activeTabId) return;

    const nextBoards = {
      ...(boardsRef.current ?? {}),
      [activeTabId]: normalizeBoard(nextBoard, columns),
    };

    boardsRef.current = nextBoards;
    await saveBoardsByTab(nextBoards);
  };

  const createCard = async (columnId, title) => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return;

    const nextBoard = normalizeBoard(activeBoard, columns);
    nextBoard[columnId] = [
      ...nextBoard[columnId],
      { id: createId('card'), title: normalizedTitle, links: [] },
    ];

    await saveActiveBoard(nextBoard);
  };

  const renameCard = async (cardId, nextTitle) => {
    const normalizedTitle = nextTitle.trim();
    if (!normalizedTitle) return false;

    const nextBoard = normalizeBoard(activeBoard, columns);
    const cardLocation = findCardLocation(nextBoard, cardId);
    if (!cardLocation) return false;

    const targetCard = nextBoard[cardLocation.columnId][cardLocation.cardIndex];
    nextBoard[cardLocation.columnId][cardLocation.cardIndex] = {
      ...targetCard,
      title: normalizedTitle,
    };

    await saveActiveBoard(nextBoard);
    return true;
  };

  const deleteCard = async (cardId) => {
    const nextBoard = normalizeBoard(activeBoard, columns);
    const cardLocation = findCardLocation(nextBoard, cardId);
    if (!cardLocation) return false;

    nextBoard[cardLocation.columnId] = nextBoard[cardLocation.columnId].filter((card) => card.id !== cardId);
    await saveActiveBoard(nextBoard);
    return true;
  };

  const addLink = async (cardId, payload) => {
    const nextBoard = normalizeBoard(activeBoard, columns);
    const cardLocation = findCardLocation(nextBoard, cardId);
    if (!cardLocation) return;

    const targetCard = nextBoard[cardLocation.columnId][cardLocation.cardIndex];
    const nextItem = {
      id: createId('item'),
      label: String(payload.title ?? '').trim(),
      href: String(payload.url ?? '').trim(),
    };

    nextBoard[cardLocation.columnId][cardLocation.cardIndex] = {
      ...targetCard,
      links: [...targetCard.links, nextItem],
    };

    await saveActiveBoard(nextBoard);
  };

  const updateLink = async (cardId, itemId, payload) => {
    const nextBoard = normalizeBoard(activeBoard, columns);
    const cardLocation = findCardLocation(nextBoard, cardId);
    if (!cardLocation) return;

    const targetCard = nextBoard[cardLocation.columnId][cardLocation.cardIndex];
    const nextLinks = targetCard.links.map((item) => (
      item.id === itemId
        ? {
          ...item,
          label: String(payload.title ?? '').trim(),
          href: String(payload.url ?? '').trim(),
        }
        : item
    ));

    nextBoard[cardLocation.columnId][cardLocation.cardIndex] = {
      ...targetCard,
      links: nextLinks,
    };

    await saveActiveBoard(nextBoard);
  };

  const deleteLink = async (cardId, itemId) => {
    const nextBoard = normalizeBoard(activeBoard, columns);
    const cardLocation = findCardLocation(nextBoard, cardId);
    if (!cardLocation) return;

    const targetCard = nextBoard[cardLocation.columnId][cardLocation.cardIndex];
    nextBoard[cardLocation.columnId][cardLocation.cardIndex] = {
      ...targetCard,
      links: targetCard.links.filter((item) => item.id !== itemId),
    };

    await saveActiveBoard(nextBoard);
  };

  const moveCard = async ({ activeCardId, overCardId, overColumnId }) => {
    const nextBoard = normalizeBoard(activeBoard, columns);
    const source = findCardLocation(nextBoard, activeCardId);
    if (!source) return;

    const sourceCards = [...nextBoard[source.columnId]];
    const [movingCard] = sourceCards.splice(source.cardIndex, 1);

    if (!movingCard) return;

    const targetColumnId = overColumnId ?? source.columnId;
    if (!nextBoard[targetColumnId]) return;

    const targetCards = source.columnId === targetColumnId ? sourceCards : [...nextBoard[targetColumnId]];
    let targetIndex = targetCards.length;

    if (overCardId) {
      const explicitIndex = targetCards.findIndex((card) => card.id === overCardId);
      if (explicitIndex !== -1) {
        targetIndex = explicitIndex;
      }
    }

    if (source.columnId === targetColumnId) {
      const currentIndex = nextBoard[source.columnId].findIndex((card) => card.id === activeCardId);
      const nextIndex = targetCards.findIndex((card) => card.id === overCardId);

      if (overCardId && currentIndex !== -1 && nextIndex !== -1) {
        nextBoard[source.columnId] = arrayMove(nextBoard[source.columnId], currentIndex, nextIndex);
      } else {
        sourceCards.splice(targetIndex, 0, movingCard);
        nextBoard[source.columnId] = sourceCards;
      }
    } else {
      nextBoard[source.columnId] = sourceCards;
      targetCards.splice(targetIndex, 0, movingCard);
      nextBoard[targetColumnId] = targetCards;
    }

    await saveActiveBoard(nextBoard);
  };

  const moveItem = async ({ activeItemId, overItemId, overCardId }) => {
    const nextBoard = normalizeBoard(activeBoard, columns);
    const source = findItemLocation(nextBoard, activeItemId);
    if (!source) return;

    let target = overItemId ? findItemLocation(nextBoard, overItemId) : null;

    if (!target && overCardId) {
      const targetCardLocation = findCardLocation(nextBoard, overCardId);
      if (targetCardLocation) {
        target = {
          columnId: targetCardLocation.columnId,
          cardIndex: targetCardLocation.cardIndex,
          itemIndex: nextBoard[targetCardLocation.columnId][targetCardLocation.cardIndex].links.length,
        };
      }
    }

    if (!target) return;

    const sourceCard = nextBoard[source.columnId][source.cardIndex];
    const targetCard = nextBoard[target.columnId][target.cardIndex];

    if (!sourceCard || !targetCard) return;

    if (source.columnId === target.columnId && source.cardIndex === target.cardIndex) {
      nextBoard[source.columnId][source.cardIndex] = {
        ...sourceCard,
        links: arrayMove(sourceCard.links, source.itemIndex, target.itemIndex),
      };

      await saveActiveBoard(nextBoard);
      return;
    }

    const sourceLinks = [...sourceCard.links];
    const [movingItem] = sourceLinks.splice(source.itemIndex, 1);
    if (!movingItem) return;

    const targetLinks = [...targetCard.links];
    targetLinks.splice(target.itemIndex, 0, movingItem);

    nextBoard[source.columnId][source.cardIndex] = {
      ...sourceCard,
      links: sourceLinks,
    };

    nextBoard[target.columnId][target.cardIndex] = {
      ...targetCard,
      links: targetLinks,
    };

    await saveActiveBoard(nextBoard);
  };

  return {
    board: activeBoard,
    isLoaded,
    createCard,
    renameCard,
    deleteCard,
    addLink,
    updateLink,
    deleteLink,
    moveCard,
    moveItem,
  };
};

export default useBoardData;
