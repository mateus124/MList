import { useEffect, useRef, useState } from 'react';
import { MdClose } from 'react-icons/md';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import styles from './SettingsModal.module.css';

const SettingsModal = ({
    isOpen,
    onClose,
    settings,
    onChangeSettings,
    onExportData,
    onImportData,
    appVersion,
}) => {
    const modalRef = useRef(null);
    const importInputRef = useRef(null);
    const [isBackupLoading, setIsBackupLoading] = useState(false);
    const [backupMessage, setBackupMessage] = useState('');
    const [backupMessageType, setBackupMessageType] = useState('info');

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

    const showBackupResult = (result, fallbackMessage) => {
        const success = Boolean(result?.success);
        const message = result?.message ?? fallbackMessage;

        setBackupMessageType(success ? 'success' : 'error');
        setBackupMessage(message);
    };

    const handleExportClick = async () => {
        if (!onExportData) {
            return;
        }

        setIsBackupLoading(true);
        setBackupMessage('');

        try {
            const result = await onExportData();
            showBackupResult(result, 'Nao foi possivel exportar o backup.');
        } catch (error) {
            showBackupResult({ success: false }, 'Nao foi possivel exportar o backup.');
        } finally {
            setIsBackupLoading(false);
        }
    };

    const handleOpenImportPicker = () => {
        importInputRef.current?.click();
    };

    const handleImportFileChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
            return;
        }

        const shouldContinue = window.confirm(
            'Importar backup vai substituir os dados atuais. Deseja continuar?',
        );

        if (!shouldContinue) {
            return;
        }

        if (!onImportData) {
            return;
        }

        setIsBackupLoading(true);
        setBackupMessage('');

        try {
            const result = await onImportData(file);
            showBackupResult(result, 'Nao foi possivel importar o backup.');
        } catch (error) {
            showBackupResult({ success: false }, 'Nao foi possivel importar o backup.');
        } finally {
            setIsBackupLoading(false);
        }
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

                    <section className={styles.backupSection}>
                        <p className={styles.backupTitle}>Backup dos dados</p>
                        <p className={styles.backupDescription}>
                            Exporte ou importe um arquivo JSON com cards de links e cards de todo lists.
                        </p>

                        <div className={styles.backupActions}>
                            <button
                                type="button"
                                className={styles.backupButton}
                                onClick={handleExportClick}
                                disabled={isBackupLoading}
                            >
                                Exportar JSON
                            </button>

                            <button
                                type="button"
                                className={styles.backupButton}
                                onClick={handleOpenImportPicker}
                                disabled={isBackupLoading}
                            >
                                Importar JSON
                            </button>
                        </div>

                        <input
                            ref={importInputRef}
                            type="file"
                            accept="application/json,.json"
                            className={styles.hiddenInput}
                            onChange={handleImportFileChange}
                        />

                        {backupMessage && (
                            <p
                                className={`${styles.backupMessage} ${
                                    backupMessageType === 'success'
                                        ? styles.backupMessageSuccess
                                        : styles.backupMessageError
                                }`}
                            >
                                {backupMessage}
                            </p>
                        )}
                    </section>
                </div>

                <footer className={styles.footer}>
                    <span>Versao atual: v{appVersion}</span>
                </footer>
            </div>
        </div>
    );
};

export default SettingsModal;
