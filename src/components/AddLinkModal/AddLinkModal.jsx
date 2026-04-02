import { useEffect, useState } from 'react';
import styles from './AddLinkModal.module.css';

const AddLinkModal = ({
    isOpen,
    onClose,
    onAddLink,
    initialData = { url: '', title: '' },
    submitLabel = 'Adicionar',
}) => {
    const [formData, setFormData] = useState({
        url: '',
        title: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;

        setFormData({
            url: initialData.url ?? '',
            title: initialData.title ?? '',
        });
        setErrors({});
    }, [isOpen, initialData.url, initialData.title]);


    const suggestTitleFromUrl = (url) => {
        try {
            const domain = new URL(url).hostname;
            const name = domain.replace('www.', '').split('.')[0];
            return name.charAt(0).toUpperCase() + name.slice(1);
        } catch {
            return '';
        }
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setFormData((prev) => ({
            ...prev,
            url,
            title: prev.title || suggestTitleFromUrl(url),
        }));
        setErrors((prev) => ({ ...prev, url: '' }));
    };

    const handleTitleChange = (e) => {
        setFormData((prev) => ({ ...prev, title: e.target.value }));
        setErrors((prev) => ({ ...prev, title: '' }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.url.trim()) {
            newErrors.url = 'URL é obrigatória';
        } else {
            try {
                new URL(formData.url);
            } catch {
                newErrors.url = 'URL inválida';
            }
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Título é obrigatório';
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onAddLink({
            url: formData.url,
            title: formData.title,
        });
    };

    const handleCancel = () => {
        setFormData({ url: '', title: '' });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
                <label htmlFor="url">URL</label>
                <input
                    id="url"
                    type="url"
                    placeholder="https://github.com"
                    value={formData.url}
                    onChange={handleUrlChange}
                    className={errors.url ? styles.error : ''}
                />
                {errors.url && <span className={styles.errorText}>{errors.url}</span>}
            </div>

            <div className={styles.field}>
                <label htmlFor="title">Título</label>
                <input
                    id="title"
                    type="text"
                    placeholder="GitHub"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className={errors.title ? styles.error : ''}
                />
                {errors.title && <span className={styles.errorText}>{errors.title}</span>}
            </div>

            <div className={styles.actions}>
                <button
                    type="submit"
                    className={styles.buttonAdd}
                >
                    {submitLabel}
                </button>
                <button
                    type="button"
                    className={styles.buttonCancel}
                    onClick={handleCancel}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default AddLinkModal;
