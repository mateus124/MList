import { useEffect, useRef, useState } from "react";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CiMenuKebab } from "react-icons/ci";
import Modal from '../Modal/Modal';
import BoardTitleModal from '../BoardTitleModal/BoardTitleModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import CardMenu from '../CardMenu/CardMenu';
import TodoItem from '../TodoItem/TodoItem';
import styles from './TodoListCard.module.css';

const TodoListCard = ({
    card,
    setNodeRef,
    cardStyle,
    isDragging,
    dragAttributes,
    dragListeners,
    itemDropIndicator,
    onRenameBoard,
    onDeleteBoard,
    onAddTodo,
    onUpdateTodo,
    onDeleteTodo,
    onToggleTodo,
}) => {
    const { id: cardId, title, todos = [] } = card;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
    const [isDeleteBoardOpen, setIsDeleteBoardOpen] = useState(false);
    const [newTodoText, setNewTodoText] = useState('');
    const [editingTodoId, setEditingTodoId] = useState(null);
    const [editingTodoText, setEditingTodoText] = useState('');
    const menuRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const incompleteTodos = todos.filter((todo) => !todo.completed);
    const completedTodos = todos.filter((todo) => todo.completed);

    const handleAddTodo = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            e.preventDefault();
            const textTrim = newTodoText.trim();
            if (!textTrim) return;
            
            onAddTodo?.(textTrim);
            setNewTodoText('');
        }
    };

    const handleStartEditTodo = (todoId, text) => {
        setEditingTodoId(todoId);
        setEditingTodoText(text);
    };

    const handleSaveEditTodo = () => {
        const textTrim = editingTodoText.trim();
        if (!textTrim) return;
        
        onUpdateTodo?.(editingTodoId, textTrim);
        setEditingTodoId(null);
        setEditingTodoText('');
    };

    const handleCancelEditTodo = () => {
        setEditingTodoId(null);
        setEditingTodoText('');
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

    const sortableTodoIds = todos.map((todo) => `todo:${todo.id}`);

    const isDropBeforeTodo = (todoId) => (
        itemDropIndicator?.overTodoId === todoId &&
        itemDropIndicator?.activeTodoId !== todoId
    );

    const shouldShowAppendLine =
        itemDropIndicator?.isAppend &&
        itemDropIndicator?.activeTodoId;

    const renderTodoItem = (todo) => {
        const isEditing = editingTodoId === todo.id;

        if (isEditing) {
            return (
                <div key={todo.id} className={styles.todoEditForm}>
                    <input
                        type="text"
                        value={editingTodoText}
                        onChange={(e) => setEditingTodoText(e.target.value)}
                        className={styles.editInput}
                        autoFocus
                    />
                    <div className={styles.editButtonsRow}>
                        <button
                            className={styles.saveBtn}
                            onClick={handleSaveEditTodo}
                        >
                            Salvar
                        </button>
                        <button
                            className={styles.cancelBtn}
                            onClick={handleCancelEditTodo}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <TodoItem
                key={todo.id}
                todo={todo}
                cardId={cardId}
                onToggle={onToggleTodo}
                onEdit={handleStartEditTodo}
                onDelete={onDeleteTodo}
            />
        );
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={cardStyle}
                className={`${styles.card} ${isDragging ? styles.dragging : ''}`.trim()}
                onContextMenu={handleCardContextMenu}
            >
                <div className={styles.header} {...dragAttributes} {...dragListeners}>
                    <h3>{title.toUpperCase()}</h3>
                    <div className={styles.actions} ref={menuRef}>
                        <button
                            title="Opções"
                            onClick={() => setIsMenuOpen((current) => !current)}
                        >
                            <CiMenuKebab size={20}/>
                        </button>

                        {isMenuOpen && (
                            <CardMenu
                                onEditBoard={handleEditBoard}
                                onDeleteBoard={handleDeleteBoard}
                            />
                        )}
                    </div>
                </div>

                <div className={styles.content}>
                    <SortableContext items={sortableTodoIds} strategy={verticalListSortingStrategy}>
                        <div className={styles.todosSection}>
                            {incompleteTodos.map((todo) => (
                                <div key={todo.id}>
                                    {isDropBeforeTodo(todo.id) ? <div className={styles.dropLine} /> : null}
                                    {renderTodoItem(todo)}
                                </div>
                            ))}
                        </div>

                        {shouldShowAppendLine ? <div className={styles.dropLine} /> : null}

                        <div className={styles.addTodoContainer}>
                            <input
                                type="text"
                                value={newTodoText}
                                onChange={(e) => setNewTodoText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddTodo(e);
                                    }
                                }}
                                placeholder="Adicionar tarefa..."
                                className={styles.addTodoInput}
                            />
                            <button
                                onClick={handleAddTodo}
                                className={styles.addTodoBtn}
                            >
                                +
                            </button>
                        </div>

                        {completedTodos.length > 0 && (
                            <div className={styles.completedSection}>
                                <div className={styles.completedLabel}>Completas</div>
                                <div className={styles.completedTodos}>
                                    {completedTodos.map((todo) => (
                                        <div key={todo.id}>
                                            {isDropBeforeTodo(todo.id) ? <div className={styles.dropLine} /> : null}
                                            {renderTodoItem(todo)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </SortableContext>
                </div>
            </div>

            <Modal 
                isOpen={isEditBoardOpen}
                onClose={() => setIsEditBoardOpen(false)}
                title="Editar Título da Lista"
            >
                <BoardTitleModal 
                    isOpen={isEditBoardOpen}
                    onClose={() => setIsEditBoardOpen(false)}
                    onSaveTitle={handleSaveBoardTitle}
                    initialTitle={title}
                />
            </Modal>

            <ConfirmModal
                isOpen={isDeleteBoardOpen}
                onClose={() => setIsDeleteBoardOpen(false)}
                onConfirm={handleConfirmDeleteBoard}
                title="Deletar Lista"
                message={`Tem certeza que deseja deletar a lista "${title}"?`}
            />
        </>
    );
};

export default TodoListCard;
