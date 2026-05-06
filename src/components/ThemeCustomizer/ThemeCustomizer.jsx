import { useEffect, useMemo, useRef, useState } from 'react';
import { HiOutlinePhoto } from 'react-icons/hi2';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import { MdOutlineSettings } from 'react-icons/md';
import SettingsModal from '../SettingsModal/SettingsModal';
import styles from './ThemeCustomizer.module.css';

const ThemeCustomizer = ({
    settings,
    themes,
    appSettings,
    onChangeSettings,
    onChangeAppSettings,
    onExportData,
    onImportData,
    onCreateTheme,
    onDeleteTheme,
    activeTheme,
    appVersion,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [themeTitle, setThemeTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isCreatingTheme, setIsCreatingTheme] = useState(false);
    const [formMessage, setFormMessage] = useState('');
    const [hoveredThemeId, setHoveredThemeId] = useState(null);
    const panelRef = useRef(null);
    const buttonRef = useRef(null);
    const settingsRef = useRef(null);
    const fileInputRef = useRef(null);

    const selectedWallpaper = useMemo(
        () => themes.find((wallpaper) => wallpaper.id === (settings.themeId ?? settings.wallpaperId)),
        [settings.themeId, settings.wallpaperId, themes],
    );

    const handleThemeChange = (themeId) => {
        if (themeId === (settings.themeId ?? settings.wallpaperId)) return;
        onChangeSettings({ ...settings, themeId, wallpaperId: themeId });
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        setSelectedFile(file ?? null);
        setFormMessage('');
    };

    const handleCreateTheme = async (event) => {
        event.preventDefault();

        if (!themeTitle.trim() || !selectedFile) {
            setFormMessage('Informe um titulo e selecione uma imagem.');
            return;
        }

        setIsCreatingTheme(true);
        setFormMessage('');

        try {
            const created = await onCreateTheme({ title: themeTitle, file: selectedFile });

            if (!created) {
                setFormMessage('Nao foi possivel criar o tema.');
                return;
            }

            setThemeTitle('');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setFormMessage('Tema criado e aplicado.');
        } catch (error) {
            setFormMessage('Nao foi possivel criar o tema.');
        } finally {
            setIsCreatingTheme(false);
        }
    };

    const handleDeleteTheme = async (event, themeId) => {
        event.preventDefault();
        event.stopPropagation();

        const deleted = await onDeleteTheme(themeId);
        if (deleted) {
            setHoveredThemeId(null);
        }
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            const clickedOnPanel = panelRef.current?.contains(event.target);
            const clickedOnButton = buttonRef.current?.contains(event.target);
            const clickedOnSettings = settingsRef.current?.contains(event.target);

            if (!clickedOnPanel && !clickedOnButton) {
                setIsOpen(false);
            }
            if (!clickedOnSettings) {
                // Don't close settings here, let the modal handle outside clicks
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    return (
        <>
            <div className={styles.buttonGroup}>
                <button
                    ref={buttonRef}
                    type="button"
                    className={styles.floatingButton}
                    onClick={() => setIsOpen((current) => !current)}
                    title="Personalizar tema"
                >
                    <HiOutlinePhoto size={24} />
                </button>
                <button
                    ref={settingsRef}
                    type="button"
                    className={styles.floatingButton}
                    onClick={() => setIsSettingsOpen((current) => !current)}
                    title="Configurações"
                >
                    <MdOutlineSettings size={24} />
                </button>
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={appSettings}
                onChangeSettings={onChangeAppSettings}
                onExportData={onExportData}
                onImportData={onImportData}
                appVersion={appVersion}
            />

            {isOpen && (
                <aside ref={panelRef} className={styles.panel}>
                    <h3>Temas</h3>
                    {activeTheme?.name && (
                        <p className={styles.activeThemeLabel}>Ativo: {activeTheme.name}</p>
                    )}

                    <p className={styles.sectionTitle}>Escolha um tema</p>

                    <div className={styles.grid}>
                        {themes.map((wallpaper) => (
                            <div
                                key={wallpaper.id}
                                className={`${styles.wallpaperItem} ${selectedWallpaper?.id === wallpaper.id ? styles.wallpaperItemActive : ''}`}
                                onMouseEnter={() => setHoveredThemeId(wallpaper.id)}
                                onMouseLeave={() => setHoveredThemeId(null)}
                            >
                                <button
                                    type="button"
                                    className={styles.wallpaperButton}
                                    onClick={() => handleThemeChange(wallpaper.id)}
                                    title={wallpaper.name}
                                >
                                    <img src={wallpaper.url} alt={wallpaper.name} />
                                    <span>{wallpaper.name}</span>
                                </button>
                                {wallpaper.kind === 'custom' && hoveredThemeId === wallpaper.id && (
                                    <button
                                        type="button"
                                        className={styles.deleteBtn}
                                        title="Deletar tema"
                                        onClick={(e) => handleDeleteTheme(e, wallpaper.id)}
                                    >
                                        <MdOutlineDeleteOutline size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className={styles.formSection}>
                        <p className={styles.sectionTitle}>Criar tema</p>
                        <form className={styles.createForm} onSubmit={handleCreateTheme}>
                            <label className={styles.fieldLabel}>
                                Titulo do tema
                                <input
                                    type="text"
                                    value={themeTitle}
                                    onChange={(event) => setThemeTitle(event.target.value)}
                                    placeholder="Ex: Aurora azul"
                                />
                            </label>

                            <label className={styles.fieldLabel}>
                                Imagem do tema
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>

                            {selectedFile && (
                                <p className={styles.fileName}>{selectedFile.name}</p>
                            )}

                            <button type="submit" className={styles.createButton} disabled={isCreatingTheme}>
                                {isCreatingTheme ? 'Criando...' : 'Criar e aplicar tema'}
                            </button>

                            {formMessage && (
                                <p className={styles.formMessage}>{formMessage}</p>
                            )}
                        </form>
                    </div>
                </aside>
            )}
        </>
    );
};

export default ThemeCustomizer;
