import { TbEdit } from 'react-icons/tb';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import styles from './CardItem.module.css';

const CardItem = ({ label, href = '#' }) => {
    const getFaviconUrl = (url) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch {
            return null;
        }
    };

    const faviconUrl = getFaviconUrl(href);

    return (
        <div className={styles.item}>
            <a href={href} rel="noreferrer" className={styles.link}>
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
                <button className={styles.actionBtn} title="Editar">
                    <TbEdit size={18} />
                </button>
                <button className={styles.actionBtn} title="Deletar">
                    <MdOutlineDeleteOutline size={18} />
                </button>
            </div>
        </div>
    )
}

export default CardItem