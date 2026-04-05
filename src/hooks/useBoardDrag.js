import { useState } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const useBoardDrag = ({ board, moveCard, moveItem, moveTodo }) => {
  const [dragState, setDragState] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = ({ active }) => {
    const activeType = active.data.current?.type;

    setDragState({
      activeType,
      activeCardId: active.data.current?.cardId ?? null,
      activeItemId: active.data.current?.itemId ?? null,
      activeTodoId: active.data.current?.todoId ?? null,
      activeItemLabel: null,
      activeItemHref: null,
      activeTodoText: null,
      overType: null,
      overColumnId: null,
      overCardId: null,
      overItemId: null,
      overTodoId: null,
    });

    if (activeType === 'item') {
      const activeItemId = active.data.current?.itemId;
      const dragItem = Object.values(board)
        .flatMap((cards) => cards.flatMap((card) => card.links))
        .find((item) => item.id === activeItemId);

      if (dragItem) {
        setDragState((current) => (current ? {
          ...current,
          activeItemLabel: dragItem.label,
          activeItemHref: dragItem.href,
        } : current));
      }
    }

    if (activeType === 'todo') {
      const activeTodoId = active.data.current?.todoId;
      const dragTodo = Object.values(board)
        .flatMap((cards) => cards.flatMap((card) => card.todos))
        .find((todo) => todo.id === activeTodoId);

      if (dragTodo) {
        setDragState((current) => (current ? {
          ...current,
          activeTodoText: dragTodo.text,
        } : current));
      }
    }
  };

  const handleDragOver = ({ over }) => {
    if (!over) {
      setDragState((current) => (current ? {
        ...current,
        overType: null,
        overColumnId: null,
        overCardId: null,
        overItemId: null,
        overTodoId: null,
      } : current));
      return;
    }

    const overType = over.data.current?.type ?? null;

    setDragState((current) => (current ? {
      ...current,
      overType,
      overColumnId: overType === 'column' ? over.data.current?.columnId : over.data.current?.columnId ?? null,
      overCardId: overType === 'item'
        ? over.data.current?.cardId
        : overType === 'todo'
          ? over.data.current?.cardId
        : overType === 'card'
          ? over.data.current?.cardId
          : null,
      overItemId: overType === 'item' ? over.data.current?.itemId : null,
      overTodoId: overType === 'todo' ? over.data.current?.todoId : null,
    } : current));
  };

  const handleDragEnd = ({ active, over }) => {
    setDragState(null);

    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'card') {
      const activeCardId = active.data.current?.cardId;
      const overCardId = overType === 'card' ? over.data.current?.cardId : null;
      const overColumnId = overType === 'column'
        ? over.data.current?.columnId
        : over.data.current?.columnId;

      if (!activeCardId || !overColumnId) return;

      moveCard({
        activeCardId,
        overCardId,
        overColumnId,
      });
      return;
    }

    if (activeType === 'item') {
      const activeItemId = active.data.current?.itemId;
      const overItemId = overType === 'item' ? over.data.current?.itemId : null;
      const overColumnId = overType === 'column' ? over.data.current?.columnId : null;

      let overCardId = overType === 'item'
        ? over.data.current?.cardId
        : overType === 'card'
          ? over.data.current?.cardId
          : null;

      if (!overCardId && overColumnId) {
        const cardsInColumn = board[overColumnId] ?? [];
        overCardId = cardsInColumn[cardsInColumn.length - 1]?.id ?? null;
      }

      if (!activeItemId || !overCardId) return;

      moveItem({
        activeItemId,
        overItemId,
        overCardId,
      });

      return;
    }

    if (activeType === 'todo') {
      const activeTodoId = active.data.current?.todoId;
      const overTodoId = overType === 'todo' ? over.data.current?.todoId : null;
      const overColumnId = overType === 'column' ? over.data.current?.columnId : null;

      let overCardId = overType === 'todo'
        ? over.data.current?.cardId
        : overType === 'card'
          ? over.data.current?.cardId
          : null;

      if (!overCardId && overColumnId) {
        const cardsInColumn = board[overColumnId] ?? [];
        overCardId = cardsInColumn[cardsInColumn.length - 1]?.id ?? null;
      }

      if (!activeTodoId || !overCardId) return;

      moveTodo({
        activeTodoId,
        overTodoId,
        overCardId,
      });
    }
  };

  const handleDragCancel = () => {
    setDragState(null);
  };

  const collisionDetectionStrategy = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    return closestCenter(args);
  };

  return {
    dragState,
    sensors,
    collisionDetectionStrategy,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
};

export default useBoardDrag;
