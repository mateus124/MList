import { useEffect, useMemo, useRef, useState } from 'react';
import { HiOutlinePhoto } from 'react-icons/hi2';
import styles from './ThemeCustomizer.module.css';

const ThemeCustomizer = ({ settings, wallpapers, onChangeSettings }) => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);
    const buttonRef = useRef(null);

    const selectedWallpaper = useMemo(
        () => wallpapers.find((wallpaper) => wallpaper.id === settings.wallpaperId),
        [settings.wallpaperId, wallpapers],
    );

    const handleWallpaperChange = (wallpaperId) => {
        if (wallpaperId === settings.wallpaperId) return;
        onChangeSettings({ ...settings, wallpaperId });
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            const clickedOnPanel = panelRef.current?.contains(event.target);
            const clickedOnButton = buttonRef.current?.contains(event.target);

            if (!clickedOnPanel && !clickedOnButton) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                className={styles.floatingButton}
                onClick={() => setIsOpen((current) => !current)}
                title="Personalizar tema"
            >
                <HiOutlinePhoto size={24} />
            </button>

            {isOpen && (
                <aside ref={panelRef} className={styles.panel}>
                    <h3>Temas</h3>

                    <p className={styles.sectionTitle}>Escolha um tema</p>

                    <div className={styles.grid}>
                        {wallpapers.map((wallpaper) => (
                            <button
                                key={wallpaper.id}
                                type="button"
                                className={`${styles.wallpaperItem} ${selectedWallpaper?.id === wallpaper.id ? styles.wallpaperItemActive : ''}`}
                                onClick={() => handleWallpaperChange(wallpaper.id)}
                                title={wallpaper.name}
                            >
                                <img src={wallpaper.url} alt={wallpaper.name} />
                                <span>{wallpaper.name}</span>
                            </button>
                        ))}
                    </div>
                </aside>
            )}
        </>
    );
};

export default ThemeCustomizer;
