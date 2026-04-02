import './App.css'
import { useEffect } from 'react';
import Header from './components/Header/Header';
import Column from './components/Column/Column';
import ThemeCustomizer from './components/ThemeCustomizer/ThemeCustomizer';
import useLocalStorage from './hooks/useLocalStorage';
import { applyThemeFromSettings, DEFAULT_THEME_SETTINGS, WALLPAPERS } from './theme/themeConfig';

function App() {
  const defaultTabs = [{ id: 'tab-home', title: 'Home' }];
  const columns = ['col-1', 'col-2', 'col-3', 'col-4'];

  const { data: tabs, saveToStorage: saveTabs } = useLocalStorage('mlist_tabs', defaultTabs);
  const { data: activeTabId, saveToStorage: saveActiveTabId } = useLocalStorage('mlist_active_tab_id', defaultTabs[0].id);
  const { data: themeSettings, saveToStorage: saveThemeSettings } = useLocalStorage('mlist_theme_settings', DEFAULT_THEME_SETTINGS);

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

  useEffect(() => {
    let isCancelled = false;

    const applyTheme = async () => {
      await applyThemeFromSettings(themeSettings, () => isCancelled);
    };

    applyTheme();

    return () => {
      isCancelled = true;
    };
  }, [themeSettings]);

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
        wallpapers={WALLPAPERS}
        onChangeSettings={saveThemeSettings}
      />
    </div>
  )
}

export default App
