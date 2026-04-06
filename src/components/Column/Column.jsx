import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Card from '../Card/Card';
import AddNewCard from '../AddNewCard/AddNewCard';
import styles from './Column.module.css';

const Column = ({
    columnId,
    cards,
    openLinksInNewTab = false,
    showAddCardButton = true,
    onCreateCard,
    onRenameCard,
    onDeleteCard,
    onAddLink,
    onUpdateLink,
    onDeleteLink,
    onAddTodo,
    onUpdateTodo,
    onDeleteTodo,
    onToggleTodo,
    dragState,
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `column:${columnId}`,
        data: {
            type: 'column',
            columnId,
        },
    });

    const sortableCardIds = cards.map((card) => `card:${card.id}`);
    const lastCardId = cards[cards.length - 1]?.id;
    const isCardDrag = dragState?.activeType === 'card';
    const isLinkDrag = dragState?.activeType === 'item';
    const isTodoDrag = dragState?.activeType === 'todo';
    const isOverCurrentColumn = dragState?.overColumnId === columnId;

    const getCardDropLinePosition = () => {
        if (!isCardDrag || !isOverCurrentColumn) {
            return { beforeCardId: null, append: false };
        }

        if (dragState?.overType === 'card' && dragState?.overCardId !== dragState?.activeCardId) {
            return { beforeCardId: dragState.overCardId, append: false };
        }

        if (dragState?.overType === 'column' || dragState?.overType === 'card') {
            const shouldAppend = lastCardId !== dragState?.activeCardId;
            return { beforeCardId: null, append: shouldAppend };
        }

        return { beforeCardId: null, append: false };
    };

    const cardDropLine = getCardDropLinePosition();

    const getItemDropIndicator = (cardId) => {
        const targetCard = cards.find((card) => card.id === cardId);
        if (!targetCard) {
            return null;
        }

        if (isLinkDrag && targetCard.type !== 'links') {
            return null;
        }

        if (isTodoDrag && targetCard.type !== 'todos') {
            return null;
        }

        const activeType = isLinkDrag ? 'item' : isTodoDrag ? 'todo' : null;
        if (!activeType) {
            return null;
        }

        const isOverItemInCard =
            dragState?.activeType === activeType &&
            dragState?.overType === activeType &&
            dragState?.overCardId === cardId;
        const isOverCard =
            dragState?.activeType === activeType &&
            dragState?.overType === 'card' &&
            dragState?.overCardId === cardId;
        const isOverColumnLastCard =
            dragState?.activeType === activeType &&
            dragState?.overType === 'column' &&
            dragState?.overColumnId === columnId &&
            cardId === lastCardId;

        if (!isOverItemInCard && !isOverCard && !isOverColumnLastCard) {
            return null;
        }

        return {
            activeItemId: activeType === 'item' ? dragState?.activeItemId : null,
            overItemId: activeType === 'item' && isOverItemInCard ? dragState?.overItemId : null,
            activeTodoId: activeType === 'todo' ? dragState?.activeTodoId : null,
            overTodoId: activeType === 'todo' && isOverItemInCard ? dragState?.overTodoId : null,
            isAppend: !isOverItemInCard,
        };
    };

    return (
        <div
            ref={setNodeRef}
            className={styles.column}
        >
            <div
                className={`${styles.cardsArea} ${isOver ? styles.cardsAreaOver : ''}`.trim()}
            >
                <SortableContext items={sortableCardIds} strategy={verticalListSortingStrategy}>
                    {cards.map((card) => (
                        <div key={card.id}>
                            {cardDropLine.beforeCardId === card.id ? <div className={styles.cardDropLine} /> : null}
                            <Card
                                card={card}
                                columnId={columnId}
                                openLinksInNewTab={openLinksInNewTab}
                                itemDropIndicator={getItemDropIndicator(card.id)}
                                onRenameBoard={(nextTitle) => onRenameCard?.(card.id, nextTitle)}
                                onDeleteBoard={() => onDeleteCard?.(card.id)}
                                onAddLink={(payload) => onAddLink?.(card.id, payload)}
                                onUpdateLink={(itemId, payload) => onUpdateLink?.(card.id, itemId, payload)}
                                onDeleteLink={(itemId) => onDeleteLink?.(card.id, itemId)}
                                onAddTodo={(text) => onAddTodo?.(card.id, text)}
                                onUpdateTodo={(todoId, text) => onUpdateTodo?.(card.id, todoId, text)}
                                onDeleteTodo={(todoId) => onDeleteTodo?.(card.id, todoId)}
                                onToggleTodo={(todoId) => onToggleTodo?.(card.id, todoId)}
                            />
                        </div>
                    ))}
                </SortableContext>
                {cardDropLine.append || (isCardDrag && isOverCurrentColumn && cards.length === 0)
                    ? <div className={styles.cardDropLine} />
                    : null}
            </div>

            {showAddCardButton ? (
                <div className={styles.addArea}>
                    <AddNewCard className={styles.addButton} onCreateCard={onCreateCard}/>
                </div>
            ) : null}
        </div>
    )
}

export default Column