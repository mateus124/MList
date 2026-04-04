import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

const DEFAULT_TABS = [{ id: 'tab-home', title: 'Home' }];

const createTabId = () => `tab-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

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

const useTabsManager = () => {
  const { data: tabs, saveToStorage: saveTabs } = useLocalStorage('mlist_tabs', DEFAULT_TABS);
  const { data: activeTabId, saveToStorage: saveActiveTabId } = useLocalStorage('mlist_active_tab_id', DEFAULT_TABS[0].id);

  useEffect(() => {
    if (!tabs.length) {
      saveTabs(DEFAULT_TABS);
      saveActiveTabId(DEFAULT_TABS[0].id);
      return;
    }

    const hasActiveTab = tabs.some((tab) => tab.id === activeTabId);
    if (!hasActiveTab) {
      saveActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId, saveTabs, saveActiveTabId]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  const selectTab = (tabId) => {
    saveActiveTabId(tabId);
  };

  const addTab = (title) => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return;

    const newTab = {
      id: createTabId(),
      title: normalizedTitle,
    };

    const updatedTabs = [...tabs, newTab];
    saveTabs(updatedTabs);
    saveActiveTabId(newTab.id);
  };

  const renameTab = async (tabId, nextTitle) => {
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

  const deleteTab = async (tabId) => {
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

  return {
    tabs,
    activeTab,
    activeTabId,
    selectTab,
    addTab,
    renameTab,
    deleteTab,
  };
};

export default useTabsManager;
