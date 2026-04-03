import Card from '../Card/Card';
import AddNewCard from '../AddNewCard/AddNewCard';
import useLocalStorage from '../../hooks/useLocalStorage';
import styles from './Column.module.css';

const Column = ({ columnId, openLinksInNewTab = false }) => {
    const storageKey = `mlist_${columnId}_cards`;
    const { data: cards, saveToStorage, removeFromStorage } = useLocalStorage(storageKey, []);

    const handleCreateCard = (title) => {
        const normalizedTitle = title.trim();
        if (!normalizedTitle) return;

        const newCard = {
            id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
            title: normalizedTitle,
        };

        saveToStorage([...cards, newCard]);
    };

    const handleRenameCard = (cardId, nextTitle) => {
        const normalizedTitle = nextTitle.trim();
        if (!normalizedTitle) return;

        const updatedCards = cards.map((card) => (
            card.id === cardId ? { ...card, title: normalizedTitle } : card
        ));

        saveToStorage(updatedCards);
    };

    const handleDeleteCard = async (cardId) => {
        const updatedCards = cards.filter((card) => card.id !== cardId);
        await saveToStorage(updatedCards);

        try {
            const linksStorageKey = `mlist_${columnId}_${cardId}_links`;
            const hasChromeStorage =
                typeof chrome !== 'undefined' &&
                chrome.storage &&
                chrome.storage.local;

            if (hasChromeStorage) {
                await chrome.storage.local.remove([linksStorageKey]);
                return;
            }

            window.localStorage.removeItem(linksStorageKey);
        } catch (error) {
            console.error('Erro ao remover links do card:', error);
        }
    };

    return (
        <div className={styles.column}>
            <div className={styles.cardsArea}>
                {cards.map((card) => (
                    <Card
                        key={card.id}
                        cardId={card.id}
                        title={card.title}
                        columnId={columnId}
                        openLinksInNewTab={openLinksInNewTab}
                        onRenameBoard={(nextTitle) => handleRenameCard(card.id, nextTitle)}
                        onDeleteBoard={() => handleDeleteCard(card.id)}
                    />
                ))}
            </div>

            <div className={styles.addArea}>
                <AddNewCard className={styles.addButton} onCreateCard={handleCreateCard}/>
            </div>
        </div>
    )
}

export default Column