import Modal from '../Modal/Modal';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, description, confirmLabel = 'Confirmar' }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className={styles.content}>
                <p className={styles.description}>{description}</p>

                <div className={styles.actions}>
                    <button type="button" className={styles.buttonConfirm} onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                    <button type="button" className={styles.buttonCancel} onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
