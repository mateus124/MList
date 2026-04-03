import './App.css'
import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header/Header';
import Column from './components/Column/Column';
import ThemeCustomizer from './components/ThemeCustomizer/ThemeCustomizer';
import useLocalStorage from './hooks/useLocalStorage';
import { getThemeById, applyThemeFromSettings, DEFAULT_THEME_SETTINGS, WALLPAPERS, extractPaletteFromFile } from './theme/themeConfig';
import { deleteThemeImage, getThemeImage, saveThemeImage } from './theme/themeImageStorage';

function App() {
  const defaultTabs = [{ id: 'tab-home', title: 'Home' }];
  const columns = ['col-1', 'col-2', 'col-3', 'col-4'];

  const { data: tabs, saveToStorage: saveTabs } = useLocalStorage('mlist_tabs', defaultTabs);
  const { data: activeTabId, saveToStorage: saveActiveTabId } = useLocalStorage('mlist_active_tab_id', defaultTabs[0].id);
  const { data: themeSettings, saveToStorage: saveThemeSettings } = useLocalStorage('mlist_theme_settings', DEFAULT_THEME_SETTINGS);
  const { data: customThemeMeta, saveToStorage: saveCustomThemeMeta } = useLocalStorage('mlist_custom_themes', []);
  const [customWallpapers, setCustomWallpapers] = useState([]);

  useEffect(() => {
    if (!tabs.length) {
      saveTabs(defaultTabs);
      saveActiveTabId(defaultTabs[0].id);
      return;
    }

    const hasActiveTab = tabs.some((tab) => tab.id === activeTabId);
    if (!hasActiveTab) {
      saveActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
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

  const handleSelectTab = (tabId) => {
    saveActiveTabId(tabId);
  };

  const handleAddTab = (title) => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return;

    const newTab = {
      id: `tab-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      title: normalizedTitle,
    };

    const updatedTabs = [...tabs, newTab];
    saveTabs(updatedTabs);
    saveActiveTabId(newTab.id);
  };

  const handleRenameTab = async (tabId, nextTitle) => {
    const normalizedTitle = nextTitle.trim();
    if (!normalizedTitle) {
      return false;
    }

    const updatedTabs = tabs.map((tab) => (
      tab.id === tabId ? { ...tab, title: normalizedTitle } : tab
    ));

    await saveTabs(updatedTabs);
    return true;
  };

  const removeStorageKeysByPrefix = async (prefix) => {
    try {
      const hasChromeStorage =
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        chrome.storage.local;

      if (hasChromeStorage) {
        const allStored = await chrome.storage.local.get(null);
        const keysToRemove = Object.keys(allStored).filter((key) => key.startsWith(prefix));

        if (keysToRemove.length) {
          await chrome.storage.local.remove(keysToRemove);
        }
        return;
      }

      const keysToRemove = [];
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {
      console.error('Erro ao limpar dados da aba:', error);
    }
  };

  const handleDeleteTab = async (tabId) => {
    if (tabs.length <= 1) {
      return false;
    }

    const removedTabIndex = tabs.findIndex((tab) => tab.id === tabId);
    if (removedTabIndex === -1) {
      return false;
    }

    const updatedTabs = tabs.filter((tab) => tab.id !== tabId);
    await saveTabs(updatedTabs);

    if (activeTabId === tabId) {
      const fallbackIndex = Math.min(removedTabIndex, updatedTabs.length - 1);
      const fallbackTabId = updatedTabs[fallbackIndex]?.id ?? updatedTabs[0]?.id;
      if (fallbackTabId) {
        await saveActiveTabId(fallbackTabId);
      }
    }

    await removeStorageKeysByPrefix(`mlist_${tabId}_`);
    return true;
  };

  const handleCreateCustomTheme = async ({ title, file }) => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle || !file) {
      return false;
    }

    const themeId = `custom-theme-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const imageId = `custom-theme-image-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

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

  const handleDeleteCustomTheme = async (themeId) => {
    const themeToDelete = customWallpapers.find((t) => t.id === themeId);
    if (!themeToDelete) return false;

    try {
      await deleteThemeImage(themeToDelete.imageId);
      const updatedMeta = customThemeMeta.filter((t) => t.id !== themeId);
      await saveCustomThemeMeta(updatedMeta);

      if (themeSettings.themeId === themeId || themeSettings.wallpaperId === themeId) {
        await saveThemeSettings({ ...themeSettings, themeId: WALLPAPERS[0].id, wallpaperId: WALLPAPERS[0].id });
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar tema personalizado:', error);
      return false;
    }
  };

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

  return (
    <div>
      <Header
        tabs={tabs}
        activeTabId={activeTab?.id}
        onSelectTab={handleSelectTab}
        onAddTab={handleAddTab}
        onRenameTab={handleRenameTab}
        onDeleteTab={handleDeleteTab}
      />
      <div className="columns">
        {columns.map((columnId) => (
          <Column
            key={`${activeTab?.id ?? 'tab-home'}_${columnId}`}
            columnId={`${activeTab?.id ?? 'tab-home'}_${columnId}`}
          />
        ))}
      </div>

      <ThemeCustomizer
        settings={themeSettings}
        themes={allThemes}
        onChangeSettings={saveThemeSettings}
        onCreateTheme={handleCreateCustomTheme}
        onDeleteTheme={handleDeleteCustomTheme}
        activeTheme={activeTheme}
      />
    </div>
  )
}

export default App
