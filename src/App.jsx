import './App.css'
import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header/Header';
import Column from './components/Column/Column';
import ThemeCustomizer from './components/ThemeCustomizer/ThemeCustomizer';
import UpdateNotice from './components/UpdateNotice/UpdateNotice';
import useLocalStorage from './hooks/useLocalStorage';
import { getThemeById, applyThemeFromSettings, DEFAULT_THEME_SETTINGS, WALLPAPERS, extractPaletteFromFile } from './theme/themeConfig';
import { deleteThemeImage, getThemeImage, saveThemeImage } from './theme/themeImageStorage';

const DEFAULT_APP_SETTINGS = {
  openLinksInNewTab: false,
  showUpdateNotifications: true,
  dismissedUpdateVersion: null,
};

const RELEASES_API_URL = 'https://api.github.com/repos/mateus124/MList/releases/latest';
const RELEASES_PAGE_URL = 'https://github.com/mateus124/MList/releases/latest';

const parseVersion = (version) => String(version ?? '')
  .trim()
  .replace(/^v/i, '')
  .split('.')
  .map((segment) => Number(segment));

const isVersionGreater = (left, right) => {
  const [leftMajor = 0, leftMinor = 0, leftPatch = 0] = parseVersion(left);
  const [rightMajor = 0, rightMinor = 0, rightPatch = 0] = parseVersion(right);

  if (leftMajor !== rightMajor) return leftMajor > rightMajor;
  if (leftMinor !== rightMinor) return leftMinor > rightMinor;
  return leftPatch > rightPatch;
};

const getCurrentAppVersion = () => {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getManifest) {
    return chrome.runtime.getManifest().version;
  }

  return 'dev';
};

function App() {
  const defaultTabs = [{ id: 'tab-home', title: 'Home' }];
  const columns = ['col-1', 'col-2', 'col-3', 'col-4'];

  const { data: tabs, saveToStorage: saveTabs } = useLocalStorage('mlist_tabs', defaultTabs);
  const { data: activeTabId, saveToStorage: saveActiveTabId } = useLocalStorage('mlist_active_tab_id', defaultTabs[0].id);
  const { data: themeSettings, saveToStorage: saveThemeSettings } = useLocalStorage('mlist_theme_settings', DEFAULT_THEME_SETTINGS);
  const { data: customThemeMeta, saveToStorage: saveCustomThemeMeta } = useLocalStorage('mlist_custom_themes', []);
  const {
    data: appSettingsData,
    saveToStorage: saveAppSettings,
    isLoaded: isAppSettingsLoaded,
  } = useLocalStorage('mlist_app_settings', DEFAULT_APP_SETTINGS);
  const [customWallpapers, setCustomWallpapers] = useState([]);
  const [appVersion, setAppVersion] = useState(getCurrentAppVersion);
  const [availableUpdateVersion, setAvailableUpdateVersion] = useState(null);

  const appSettings = useMemo(
    () => ({ ...DEFAULT_APP_SETTINGS, ...(appSettingsData ?? {}) }),
    [appSettingsData],
  );

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

  const handleChangeAppSettings = (nextSettings) => {
    saveAppSettings({ ...DEFAULT_APP_SETTINGS, ...nextSettings });
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

  useEffect(() => {
    setAppVersion(getCurrentAppVersion());
  }, []);

  useEffect(() => {
    if (!isAppSettingsLoaded || !appSettings.showUpdateNotifications) {
      setAvailableUpdateVersion(null);
      return;
    }

    let isCancelled = false;

    const checkForUpdates = async () => {
      try {
        const response = await fetch(RELEASES_API_URL);
        if (!response.ok) return;

        const data = await response.json();
        const latestVersion = String(data.tag_name ?? '').replace(/^v/i, '');
        const currentVersion = getCurrentAppVersion();

        if (!latestVersion || !isVersionGreater(latestVersion, currentVersion)) {
          if (!isCancelled) {
            setAvailableUpdateVersion(null);
          }
          return;
        }

        if (appSettings.dismissedUpdateVersion === latestVersion) {
          return;
        }

        if (!isCancelled) {
          setAvailableUpdateVersion(latestVersion);
        }
      } catch (error) {
        console.error('Erro ao verificar atualizacoes:', error);
      }
    };

    checkForUpdates();

    return () => {
      isCancelled = true;
    };
  }, [
    appSettings.dismissedUpdateVersion,
    appSettings.showUpdateNotifications,
    isAppSettingsLoaded,
  ]);

  useEffect(() => {
    if (!availableUpdateVersion) return;

    const timeoutId = window.setTimeout(() => {
      setAvailableUpdateVersion(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [availableUpdateVersion]);

  const handleDismissUpdateNotice = () => {
    setAvailableUpdateVersion(null);

    if (!appSettings.showUpdateNotifications || !availableUpdateVersion) {
      return;
    }

    handleChangeAppSettings({
      ...appSettings,
      dismissedUpdateVersion: availableUpdateVersion,
    });
  };

  const handleUpdateNow = () => {
    handleDismissUpdateNotice();
    window.open(RELEASES_PAGE_URL, '_blank', 'noopener,noreferrer');
  };

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
            openLinksInNewTab={appSettings.openLinksInNewTab}
          />
        ))}
      </div>

      <ThemeCustomizer
        settings={themeSettings}
        themes={allThemes}
        appSettings={appSettings}
        onChangeSettings={saveThemeSettings}
        onChangeAppSettings={handleChangeAppSettings}
        onCreateTheme={handleCreateCustomTheme}
        onDeleteTheme={handleDeleteCustomTheme}
        activeTheme={activeTheme}
        appVersion={appVersion}
      />

      <UpdateNotice
        latestVersion={availableUpdateVersion}
        onDismiss={handleDismissUpdateNotice}
        onUpdateNow={handleUpdateNow}
      />
    </div>
  )
}

export default App
