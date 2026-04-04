import { useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TbEdit } from 'react-icons/tb';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import styles from './CardItem.module.css';

const CardItem = ({
    itemId,
    cardId,
    label,
    href = '#',
    onEdit,
    onDelete,
    openInNewTab = false,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `item:${itemId}`,
        data: {
            type: 'item',
            itemId,
            cardId,
        },
    });

    const itemStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    const wasDraggingRef = useRef(false);

    useEffect(() => {
        if (isDragging) {
            wasDraggingRef.current = true;
            return;
        }

        if (!wasDraggingRef.current) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            wasDraggingRef.current = false;
        }, 120);

        return () => window.clearTimeout(timeoutId);
    }, [isDragging]);

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
        if (isDragging || wasDraggingRef.current) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (openInNewTab) {
            event.preventDefault();
            window.open(href, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={itemStyle}
            className={`${styles.item} ${isDragging ? styles.dragging : ''}`.trim()}
            {...attributes}
            {...listeners}
        >
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