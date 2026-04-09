import { FiExternalLink, FiEdit3 } from 'react-icons/fi';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import styles from './CardMenu.module.css';

const CardMenu = ({ onOpenAllLinks, onEditBoard, onDeleteBoard }) => {
    const canOpenAllLinks = typeof onOpenAllLinks === 'function';
    const canEditBoard = typeof onEditBoard === 'function';
    const canDeleteBoard = typeof onDeleteBoard === 'function';

    return (
        <div className={styles.menu}>
            {canOpenAllLinks && (
                <button type="button" className={styles.menuItem} onClick={onOpenAllLinks}>
                    <FiExternalLink size={16} />
                    <span>Abrir todos os links</span>
                </button>
            )}
            {canEditBoard && (
                <button type="button" className={styles.menuItem} onClick={onEditBoard}>
                    <FiEdit3 size={16} />
                    <span>Editar card</span>
                </button>
            )}
            {canDeleteBoard && (
                <button type="button" className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={onDeleteBoard}>
                    <MdOutlineDeleteOutline size={16} />
                    <span>Deletar card</span>
                </button>
            )}
        </div>
    );
};

export default CardMenu;
