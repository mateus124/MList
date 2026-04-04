import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Card from '../Card/Card';
import AddNewCard from '../AddNewCard/AddNewCard';
import styles from './Column.module.css';

const Column = ({
    columnId,
    cards,
    openLinksInNewTab = false,
    onCreateCard,
    onRenameCard,
    onDeleteCard,
    onAddLink,
    onUpdateLink,
    onDeleteLink,
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
    const isItemDrag = dragState?.activeType === 'item';
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
        const isOverItemInCard =
            isItemDrag &&
            dragState?.overType === 'item' &&
            dragState?.overCardId === cardId;
        const isOverCard =
            isItemDrag &&
            dragState?.overType === 'card' &&
            dragState?.overCardId === cardId;
        const isOverColumnLastCard =
            isItemDrag &&
            dragState?.overType === 'column' &&
            dragState?.overColumnId === columnId &&
            cardId === lastCardId;

        if (!isOverItemInCard && !isOverCard && !isOverColumnLastCard) {
            return null;
        }

        return {
            activeItemId: dragState?.activeItemId,
            overItemId: isOverItemInCard ? dragState?.overItemId : null,
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
                            />
                        </div>
                    ))}
                </SortableContext>
                {cardDropLine.append || (isCardDrag && isOverCurrentColumn && cards.length === 0)
                    ? <div className={styles.cardDropLine} />
                    : null}
            </div>

            <div className={styles.addArea}>
                <AddNewCard className={styles.addButton} onCreateCard={onCreateCard}/>
            </div>
        </div>
    )
}

export default Column