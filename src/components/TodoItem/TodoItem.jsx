import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TbEdit } from 'react-icons/tb';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import styles from './TodoItem.module.css';

const TodoItem = ({
  todo,
  cardId,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `todo:${todo.id}`,
    data: {
      type: 'todo',
      todoId: todo.id,
      cardId,
    },
  });

  const itemStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={itemStyle}
      className={`${styles.todoItem} ${todo.completed ? styles.completed : ''} ${isDragging ? styles.dragging : ''}`.trim()}
      {...attributes}
      {...listeners}
    >
      <div className={styles.todoContent}>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle?.(todo.id)}
          className={styles.checkbox}
          title={todo.completed ? 'Marcar como incompleta' : 'Marcar como completa'}
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        />
        <span className={styles.todoText}>{todo.text}</span>
      </div>

      <div className={styles.todoActions}>
        <button
          className={styles.iconBtn}
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.(todo.id, todo.text);
          }}
          title="Editar tarefa"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <TbEdit size={16} />
        </button>
        <button
          className={styles.iconBtn}
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.(todo.id);
          }}
          title="Deletar tarefa"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <MdOutlineDeleteOutline size={16} />
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
