import './App.css'
import { useMemo } from 'react';
import Header from './components/Header/Header';
import Column from './components/Column/Column';
import ThemeCustomizer from './components/ThemeCustomizer/ThemeCustomizer';
import UpdateNotice from './components/UpdateNotice/UpdateNotice';
import useLocalStorage from './hooks/useLocalStorage';
import useTabsManager from './hooks/useTabsManager';
import useThemeManager from './hooks/useThemeManager';
import useUpdateChecker, { RELEASES_PAGE_URL } from './hooks/useUpdateChecker';

const DEFAULT_APP_SETTINGS = {
  openLinksInNewTab: false,
  showUpdateNotifications: true,
  dismissedUpdateVersion: null,
};

const COLUMNS = ['col-1', 'col-2', 'col-3', 'col-4'];

function App() {
  const {
    tabs,
    activeTab,
    activeTabId,
    selectTab,
    addTab,
    renameTab,
    deleteTab,
  } = useTabsManager();
  const {
    themeSettings,
    saveThemeSettings,
    allThemes,
    activeTheme,
    createCustomTheme,
    deleteCustomTheme,
  } = useThemeManager();
  const {
    data: appSettingsData,
    saveToStorage: saveAppSettings,
    isLoaded: isAppSettingsLoaded,
  } = useLocalStorage('mlist_app_settings', DEFAULT_APP_SETTINGS);
  const {
    appVersion,
    availableUpdateVersion,
    dismissUpdateNotice,
  } = useUpdateChecker({
    enabled: appSettingsData?.showUpdateNotifications ?? DEFAULT_APP_SETTINGS.showUpdateNotifications,
    isSettingsLoaded: isAppSettingsLoaded,
    dismissedVersion: appSettingsData?.dismissedUpdateVersion ?? null,
  });

  const appSettings = useMemo(
    () => ({ ...DEFAULT_APP_SETTINGS, ...(appSettingsData ?? {}) }),
    [appSettingsData],
  );

  const handleChangeAppSettings = (nextSettings) => {
    saveAppSettings({ ...DEFAULT_APP_SETTINGS, ...nextSettings });
  };

  const handleDismissUpdateNotice = () => {
    dismissUpdateNotice();

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
        activeTabId={activeTabId ?? activeTab?.id}
        onSelectTab={selectTab}
        onAddTab={addTab}
        onRenameTab={renameTab}
        onDeleteTab={deleteTab}
      />
      <div className="columns">
        {COLUMNS.map((columnId) => (
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
        onCreateTheme={createCustomTheme}
        onDeleteTheme={deleteCustomTheme}
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
