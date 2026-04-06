import { useEffect, useRef } from 'react';
import { MdClose } from 'react-icons/md';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import styles from './SettingsModal.module.css';

const SettingsModal = ({ isOpen, onClose, settings, onChangeSettings, appVersion }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
            return () => document.removeEventListener('mousedown', handleOutsideClick);
        }
    }, [isOpen, onClose]);

    const handleToggle = (key) => {
        onChangeSettings({
            ...settings,
            [key]: !settings[key],
        });
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div ref={modalRef} className={styles.modal}>
                <div className={styles.header}>
                    <h2>Configurações</h2>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        title="Fechar"
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    <label className={styles.setting}>
                        <div className={styles.settingLabel}>
                            <span>Abrir links em nova guia</span>
                        </div>
                        <ToggleSwitch
                            checked={settings.openLinksInNewTab ?? false}
                            onChange={() => handleToggle('openLinksInNewTab')}
                        />
                    </label>

                    <label className={styles.setting}>
                        <div className={styles.settingLabel}>
                            <span>Avisar sobre novas versoes</span>
                        </div>
                        <ToggleSwitch
                            checked={settings.showUpdateNotifications ?? true}
                            onChange={() => handleToggle('showUpdateNotifications')}
                        />
                    </label>

                    <label className={styles.setting}>
                        <div className={styles.settingLabel}>
                            <span>Mostrar botao de adicionar cards</span>
                        </div>
                        <ToggleSwitch
                            checked={settings.showAddCardButton ?? true}
                            onChange={() => handleToggle('showAddCardButton')}
                        />
                    </label>
                </div>

                <footer className={styles.footer}>
                    <span>Versao atual: v{appVersion}</span>
                </footer>
            </div>
        </div>
    );
};

export default SettingsModal;
