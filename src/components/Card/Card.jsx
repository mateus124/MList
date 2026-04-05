import { useEffect, useRef, useState } from "react";
import { CSS } from '@dnd-kit/utilities';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TbLinkPlus } from "react-icons/tb";
import { CiMenuKebab } from "react-icons/ci";
import CardItem from '../CardItem/CardItem';
import Modal from '../Modal/Modal';
import AddLinkModal from '../AddLinkModal/AddLinkModal';
import CardMenu from '../CardMenu/CardMenu';
import BoardTitleModal from '../BoardTitleModal/BoardTitleModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import TodoListCard from '../TodoListCard/TodoListCard';
import styles from './Card.module.css';

const Card = ({
    card,
    columnId,
    openLinksInNewTab = false,
    onRenameBoard,
    onDeleteBoard,
    onAddLink,
    onUpdateLink,
    onDeleteLink,
    onAddTodo,
    onUpdateTodo,
    onDeleteTodo,
    onToggleTodo,
    itemDropIndicator,
}) => {
    const { id: cardId, title, type = 'links', links = [] } = card;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
    const [isDeleteBoardOpen, setIsDeleteBoardOpen] = useState(false);
    const menuRef = useRef(null);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `card:${cardId}`,
        data: {
            type: 'card',
            cardId,
            columnId,
        },
    });

    const sortableItemIds = links.map((link) => `item:${link.id}`);

    const cardStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItemId(null);
    };

    const handleSubmitLink = (newLink) => {
        if (editingItemId === null) {
            onAddLink?.(newLink);
        } else {
            onUpdateLink?.(editingItemId, newLink);
        }
        closeModal();
    };

    const handleDeleteLink = (itemId) => {
        onDeleteLink?.(itemId);
    };

    const handleOpenAllLinks = () => {
        links.forEach((link) => {
            window.open(link.href, '_blank', 'noopener,noreferrer');
        });
        setIsMenuOpen(false);
    };

    const handleEditBoard = () => {
        setIsMenuOpen(false);
        setIsEditBoardOpen(true);
    };

    const handleDeleteBoard = () => {
        setIsMenuOpen(false);
        setIsDeleteBoardOpen(true);
    };

    const handleSaveBoardTitle = (nextTitle) => {
        onRenameBoard?.(nextTitle);
        setIsEditBoardOpen(false);
    };

    const handleConfirmDeleteBoard = () => {
        onDeleteBoard?.();
        setIsDeleteBoardOpen(false);
    };

    const handleCardContextMenu = (event) => {
        event.preventDefault();
        setIsMenuOpen(true);
    };

    const isDropBeforeItem = (itemId) => (
        itemDropIndicator?.overItemId === itemId &&
        itemDropIndicator?.activeItemId !== itemId
    );

    const shouldShowAppendLine =
        itemDropIndicator?.isAppend &&
        itemDropIndicator?.activeItemId;

    // Se for card de todo list, renderizar TodoListCard
    if (type === 'todos') {
        return (
            <TodoListCard
                card={card}
                setNodeRef={setNodeRef}
                cardStyle={cardStyle}
                isDragging={isDragging}
                dragAttributes={attributes}
                dragListeners={listeners}
                itemDropIndicator={itemDropIndicator}
                onRenameBoard={onRenameBoard}
                onDeleteBoard={onDeleteBoard}
                onAddTodo={onAddTodo}
                onUpdateTodo={onUpdateTodo}
                onDeleteTodo={onDeleteTodo}
                onToggleTodo={onToggleTodo}
            />
        );
    }

    // Renderizar card de links (default)
    return (
        <>
            <div
                ref={setNodeRef}
                style={cardStyle}
                className={`${styles.card} ${isDragging ? styles.dragging : ''}`.trim()}
                onContextMenu={handleCardContextMenu}
            >
                <div className={styles.header} {...attributes} {...listeners}>
                    <h3>{title.toUpperCase()}</h3>
                    <div className={styles.actions} ref={menuRef}>
                        <button 
                            title="Adicionar Link"
                            onClick={() => {
                                setEditingItemId(null);
                                setIsModalOpen(true);
                            }}
                        >
                            <TbLinkPlus size={20}/>
                        </button>
                        <button
                            title="Opções"
                            onClick={() => setIsMenuOpen((current) => !current)}
                        >
                            <CiMenuKebab size={20}/>
                        </button>

                        {isMenuOpen && (
                            <CardMenu
                                onOpenAllLinks={handleOpenAllLinks}
                                onEditBoard={handleEditBoard}
                                onDeleteBoard={handleDeleteBoard}
                            />
                        )}
                    </div>
                </div>
                <div className={styles.content}>
                    <SortableContext items={sortableItemIds} strategy={verticalListSortingStrategy}>
                        {links.map((link) => (
                            <div key={link.id}>
                                {isDropBeforeItem(link.id) ? <div className={styles.dropLine} /> : null}
                                <CardItem
                                    itemId={link.id}
                                    cardId={cardId}
                                    label={link.label}
                                    href={link.href}
                                    openInNewTab={openLinksInNewTab}
                                    onEdit={() => {
                                        setEditingItemId(link.id);
                                        setIsModalOpen(true);
                                    }}
                                    onDelete={() => handleDeleteLink(link.id)}
                                />
                            </div>
                        ))}
                    </SortableContext>
                    {shouldShowAppendLine ? <div className={styles.dropLine} /> : null}
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={closeModal}
                title={editingItemId === null ? "Adicionar Link" : "Editar Link"}
            >
                <AddLinkModal 
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onAddLink={handleSubmitLink}
                    initialData={
                        editingItemId === null
                            ? { url: '', title: '' }
                            : {
                                url: links.find((link) => link.id === editingItemId)?.href ?? '',
                                title: links.find((link) => link.id === editingItemId)?.label ?? '',
                            }
                    }
                    submitLabel={editingItemId === null ? 'Adicionar' : 'Salvar'}
                />
            </Modal>

            <Modal
                isOpen={isEditBoardOpen}
                onClose={() => setIsEditBoardOpen(false)}
                title="Editar card"
            >
                <BoardTitleModal
                    isOpen={isEditBoardOpen}
                    onClose={() => setIsEditBoardOpen(false)}
                    onSave={handleSaveBoardTitle}
                    initialTitle={title}
                />
            </Modal>

            <ConfirmModal
                isOpen={isDeleteBoardOpen}
                onClose={() => setIsDeleteBoardOpen(false)}
                onConfirm={handleConfirmDeleteBoard}
                title="Deletar card"
                description={`Tem certeza que deseja deletar \"${title}\"? Esta ação não pode ser desfeita.`}
                confirmLabel="Deletar"
            />
        </>
    )
}

export default Card