import { useEffect, useState } from 'react';
import styles from './BoardTitleModal.module.css';

const BoardTitleModal = ({
    isOpen,
    onClose,
    onSave,
    initialTitle = '',
    placeholder = 'Digite o título do card...',
    requiredMessage = 'Nome do card é obrigatório',
    submitLabel = 'Atualizar',
}) => {
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
            setError(requiredMessage);
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
                placeholder={placeholder}
                className={styles.input}
                autoFocus
                maxLength={40}
            />

            {error && <span className={styles.errorText}>{error}</span>}

            <div className={styles.actions}>
                <button type="submit" className={styles.buttonAdd}>
                    {submitLabel}
                </button>
                <button type="button" className={styles.buttonCancel} onClick={onClose}>
                    ×
                </button>
            </div>
        </form>
    );
};

export default BoardTitleModal;
