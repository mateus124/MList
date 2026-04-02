import { useEffect, useState } from 'react';
import styles from './BoardTitleModal.module.css';

const BoardTitleModal = ({ isOpen, onClose, onSave, initialTitle = '' }) => {
    const [value, setValue] = useState(initialTitle);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setValue(initialTitle);
            setError('');
        }
    }, [isOpen, initialTitle]);

    if (!isOpen) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        const normalizedValue = value.trim();

        if (!normalizedValue) {
            setError('Nome do card é obrigatório');
            return;
        }

        onSave(normalizedValue);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <input
                type="text"
                value={value}
                onChange={(event) => {
                    setValue(event.target.value);
                    setError('');
                }}
                placeholder="Digite o título do card..."
                className={styles.input}
                autoFocus
                maxLength={40}
            />

            {error && <span className={styles.errorText}>{error}</span>}

            <div className={styles.actions}>
                <button type="submit" className={styles.buttonAdd}>
                    Atualizar
                </button>
                <button type="button" className={styles.buttonCancel} onClick={onClose}>
                    ×
                </button>
            </div>
        </form>
    );
};

export default BoardTitleModal;
