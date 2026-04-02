import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import styles from './AddNewCard.module.css';

const AddNewCard = ({ className = '', onCreateCard }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');

    const resetForm = () => {
        setTitle('');
        setIsCreating(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const normalizedTitle = title.trim();
        if (!normalizedTitle) return;

        onCreateCard?.(normalizedTitle);
        resetForm();
    };

    if (isCreating) {
        return (
            <form className={`${styles.form} ${className}`.trim()} onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título Card..."
                    className={styles.input}
                    maxLength={40}
                    autoFocus
                />

                <button type="submit" className={styles.buttonAdd}>
                    Adicionar
                </button>

                <button type="button" className={styles.buttonCancel} onClick={resetForm}>
                    <IoClose size={18}/>
                </button>
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