import { TbEdit } from 'react-icons/tb';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import styles from './CardItem.module.css';

const CardItem = ({ label, href = '#', onEdit, onDelete, openInNewTab = false }) => {
    const getFaviconUrl = (url) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch {
            return null;
        }
    };

    const faviconUrl = getFaviconUrl(href);

    const handleLinkClick = (event) => {
        if (openInNewTab) {
            event.preventDefault();
            window.open(href, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className={styles.item}>
            <a href={href} rel="noreferrer" className={styles.link} onClick={handleLinkClick}>
                {faviconUrl && (
                    <img 
                        src={faviconUrl} 
                        alt={label} 
                        className={styles.favicon}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                )}
                <span className={styles.label}>{label}</span>
            </a>
            <div className={styles.actions}>
                <button className={styles.actionBtn} title="Editar" onClick={onEdit}>
                    <TbEdit size={18} />
                </button>
                <button className={styles.actionBtn} title="Deletar" onClick={onDelete}>
                    <MdOutlineDeleteOutline size={18} />
                </button>
            </div>
        </div>
    )
}

export default CardItem