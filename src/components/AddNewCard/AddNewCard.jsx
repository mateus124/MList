import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import styles from './AddNewCard.module.css';

const AddNewCard = ({ className = '', onCreateCard }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [cardType, setCardType] = useState('links');

    const resetForm = () => {
        setTitle('');
        setCardType('links');
        setIsCreating(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const normalizedTitle = title.trim();
        if (!normalizedTitle) return;

        onCreateCard?.(normalizedTitle, cardType);
        resetForm();
    };

    if (isCreating) {
        return (
            <form className={`${styles.form} ${className}`.trim()} onSubmit={handleSubmit}>
                <div className={styles.typeSelector}>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="cardType"
                            value="links"
                            checked={cardType === 'links'}
                            onChange={(e) => setCardType(e.target.value)}
                            className={styles.radio}
                        />
                        <span>Links</span>
                    </label>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="cardType"
                            value="todos"
                            checked={cardType === 'todos'}
                            onChange={(e) => setCardType(e.target.value)}
                            className={styles.radio}
                        />
                        <span>Tarefas</span>
                    </label>
                </div>

                <div className={styles.inputRow}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título Card..."
                        className={styles.input}
                        maxLength={40}
                        autoFocus
                    />
                </div>

                <div className={styles.buttonsRow}>
                    <button type="submit" className={styles.buttonAdd}>
                        Adicionar
                    </button>

                    <button type="button" className={styles.buttonCancel} onClick={resetForm}>
                        <IoClose size={18}/>
                    </button>
                </div>
            </form>
        )
    }

    return (
        <button type="button" className={`${styles.button} ${className}`.trim()} onClick={() => setIsCreating(true)}>
            <FiPlusCircle/>
            <p>Adicionar Card</p>
        </button>
    )
}

export default AddNewCard