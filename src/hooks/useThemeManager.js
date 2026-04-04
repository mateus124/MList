import { useEffect, useMemo, useState } from 'react';
import useLocalStorage from './useLocalStorage';
import {
  applyThemeFromSettings,
  DEFAULT_THEME_SETTINGS,
  extractPaletteFromFile,
  getThemeById,
  WALLPAPERS,
} from '../theme/themeConfig';
import {
  deleteThemeImage,
  getThemeImage,
  saveThemeImage,
} from '../theme/themeImageStorage';

const createCustomThemeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const useThemeManager = () => {
  const { data: themeSettings, saveToStorage: saveThemeSettings } = useLocalStorage('mlist_theme_settings', DEFAULT_THEME_SETTINGS);
  const { data: customThemeMeta, saveToStorage: saveCustomThemeMeta } = useLocalStorage('mlist_custom_themes', []);
  const [customWallpapers, setCustomWallpapers] = useState([]);

  const allThemes = useMemo(() => [...WALLPAPERS, ...customWallpapers], [customWallpapers]);

  useEffect(() => {
    let isCancelled = false;
    const createdUrls = [];

    const hydrateCustomThemes = async () => {
      const loadedThemes = await Promise.all(
        customThemeMeta.map(async (themeMeta) => {
          const storedImage = await getThemeImage(themeMeta.imageId);
          if (!storedImage?.blob) {
            return null;
          }

          const url = URL.createObjectURL(storedImage.blob);
          createdUrls.push(url);

          return {
            ...themeMeta,
            kind: 'custom',
            url,
            palette: themeMeta.palette,
            fallbackPalette: themeMeta.palette,
          };
        }),
      );

      if (isCancelled) {
        createdUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }

      setCustomWallpapers(loadedThemes.filter(Boolean));
    };

    hydrateCustomThemes();

    return () => {
      isCancelled = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [customThemeMeta]);

  useEffect(() => {
    let isCancelled = false;

    const applyTheme = async () => {
      await applyThemeFromSettings(themeSettings, allThemes, () => isCancelled);
    };

    applyTheme();

    return () => {
      isCancelled = true;
    };
  }, [themeSettings, allThemes]);

  const activeTheme = getThemeById(allThemes, themeSettings.themeId ?? themeSettings.wallpaperId ?? WALLPAPERS[0].id);

  const createCustomTheme = async ({ title, file }) => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle || !file) {
      return false;
    }

    const themeId = createCustomThemeId('custom-theme');
    const imageId = createCustomThemeId('custom-theme-image');

    const palette = await extractPaletteFromFile(file);

    try {
      await saveThemeImage(imageId, file);

      const newTheme = {
        id: themeId,
        name: normalizedTitle,
        imageId,
        palette,
        kind: 'custom',
        createdAt: Date.now(),
      };

      await saveCustomThemeMeta([...customThemeMeta, newTheme]);
      await saveThemeSettings({ ...themeSettings, themeId, wallpaperId: themeId });
      return true;
    } catch (error) {
      await deleteThemeImage(imageId);
      console.error('Erro ao criar tema personalizado:', error);
      return false;
    }
  };

  const deleteCustomTheme = async (themeId) => {
    const themeToDelete = customWallpapers.find((theme) => theme.id === themeId);
    if (!themeToDelete) return false;

    try {
      await deleteThemeImage(themeToDelete.imageId);
      const updatedMeta = customThemeMeta.filter((theme) => theme.id !== themeId);
      await saveCustomThemeMeta(updatedMeta);

      if (themeSettings.themeId === themeId || themeSettings.wallpaperId === themeId) {
        await saveThemeSettings({
          ...themeSettings,
          themeId: WALLPAPERS[0].id,
          wallpaperId: WALLPAPERS[0].id,
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar tema personalizado:', error);
      return false;
    }
  };

  return {
    themeSettings,
    saveThemeSettings,
    allThemes,
    activeTheme,
    createCustomTheme,
    deleteCustomTheme,
  };
};

export default useThemeManager;
