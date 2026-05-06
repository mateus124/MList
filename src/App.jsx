import './App.css'
import { useMemo } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import Header from './components/Header/Header';
import Column from './components/Column/Column';
import ThemeCustomizer from './components/ThemeCustomizer/ThemeCustomizer';
import UpdateNotice from './components/UpdateNotice/UpdateNotice';
import useBoardDrag from './hooks/useBoardDrag';
import useLocalStorage from './hooks/useLocalStorage';
import useBoardData from './hooks/useBoardData';
import useTabsManager from './hooks/useTabsManager';
import useThemeManager from './hooks/useThemeManager';
import useUpdateChecker, { RELEASES_PAGE_URL } from './hooks/useUpdateChecker';

const APP_BACKUP_VERSION = 1;

const DEFAULT_APP_SETTINGS = {
  openLinksInNewTab: false,
  showUpdateNotifications: true,
  showAddCardButton: true,
  dismissedUpdateVersion: null,
};

const COLUMNS = ['col-1', 'col-2', 'col-3', 'col-4'];

const normalizeImportedTabs = (tabs) => {
  if (!Array.isArray(tabs)) {
    return [];
  }

  return tabs
    .map((tab) => ({
      id: String(tab?.id ?? '').trim(),
      title: String(tab?.title ?? '').trim(),
    }))
    .filter((tab) => tab.id && tab.title);
};

const parseBackupPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Arquivo invalido.');
  }

  const tabs = normalizeImportedTabs(payload.tabs);
  if (!tabs.length) {
    throw new Error('Backup sem abas validas.');
  }

  if (!payload.boardsByTab || typeof payload.boardsByTab !== 'object') {
    throw new Error('Backup sem dados de cards.');
  }

  const tabIds = tabs.map((tab) => tab.id);
  const safeBoardsByTab = tabIds.reduce((result, tabId) => {
    result[tabId] = payload.boardsByTab[tabId] ?? {};
    return result;
  }, {});

  const requestedActiveTabId = String(payload.activeTabId ?? '').trim();
  const activeTabId = tabIds.includes(requestedActiveTabId)
    ? requestedActiveTabId
    : tabIds[0];

  return {
    tabs,
    activeTabId,
    boardsByTab: safeBoardsByTab,
  };
};

const createBackupFileName = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  return `mlist-backup-${date}_${time}.json`;
};

const downloadJson = (fileName, jsonContent) => {
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
};

function App() {
  const {
    tabs,
    activeTab,
    activeTabId,
    isLoaded: isTabsLoaded,
    selectTab,
    addTab,
    renameTab,
    deleteTab,
    replaceTabsData,
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
  const {
    board,
    createCard,
    renameCard,
    deleteCard,
    addLink,
    updateLink,
    deleteLink,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    moveCard,
    moveItem,
    moveTodo,
    boardsByTab,
    isLoaded: isBoardLoaded,
    replaceBoardsByTab,
  } = useBoardData({
    activeTabId: activeTabId ?? activeTab?.id,
    columns: COLUMNS,
  });
  const {
    dragState,
    sensors,
    collisionDetectionStrategy,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useBoardDrag({
    board,
    moveCard,
    moveItem,
    moveTodo,
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

  const handleExportData = async () => {
    try {
      if (!isTabsLoaded || !isBoardLoaded) {
        return {
          success: false,
          message: 'Aguarde os dados serem carregados e tente novamente.',
        };
      }

      const backupPayload = {
        type: 'mlist-backup',
        version: APP_BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        tabs,
        activeTabId: activeTabId ?? activeTab?.id ?? tabs[0]?.id,
        boardsByTab,
      };

      downloadJson(
        createBackupFileName(),
        JSON.stringify(backupPayload, null, 2),
      );

      return {
        success: true,
        message: 'Backup exportado em JSON com sucesso.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Nao foi possivel exportar os dados.',
      };
    }
  };

  const handleImportData = async (file) => {
    try {
      if (!file) {
        return {
          success: false,
          message: 'Selecione um arquivo JSON.',
        };
      }

      if (!isTabsLoaded || !isBoardLoaded) {
        return {
          success: false,
          message: 'Aguarde os dados serem carregados e tente novamente.',
        };
      }

      const rawText = await file.text();
      const parsedJson = JSON.parse(rawText);
      const parsedBackup = parseBackupPayload(parsedJson);

      await replaceBoardsByTab(parsedBackup.boardsByTab, parsedBackup.tabs.map((tab) => tab.id));
      await replaceTabsData({
        tabs: parsedBackup.tabs,
        activeTabId: parsedBackup.activeTabId,
      });

      return {
        success: true,
        message: 'Backup importado com sucesso.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Nao foi possivel importar o backup JSON.',
      };
    }
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
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="columns">
          {COLUMNS.map((columnId) => (
            <Column
              key={`${activeTab?.id ?? 'tab-home'}_${columnId}`}
              columnId={columnId}
              cards={board[columnId] ?? []}
              openLinksInNewTab={appSettings.openLinksInNewTab}
              showAddCardButton={appSettings.showAddCardButton}
              onCreateCard={(title, type) => createCard(columnId, title, type)}
              onRenameCard={renameCard}
              onDeleteCard={deleteCard}
              onAddLink={addLink}
              onUpdateLink={updateLink}
              onDeleteLink={deleteLink}
              onAddTodo={addTodo}
              onUpdateTodo={updateTodo}
              onDeleteTodo={deleteTodo}
              onToggleTodo={toggleTodo}
              dragState={dragState}
            />
          ))}
        </div>
        <DragOverlay>
          {dragState?.activeType === 'item' ? (
            <div className="dragLinkOverlay" aria-hidden="true">
              <span className="dragLinkOverlayLabel">{dragState.activeItemLabel ?? 'Link'}</span>
              <span className="dragLinkOverlayHref">{dragState.activeItemHref ?? ''}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ThemeCustomizer
        settings={themeSettings}
        themes={allThemes}
        appSettings={appSettings}
        onChangeSettings={saveThemeSettings}
        onChangeAppSettings={handleChangeAppSettings}
        onExportData={handleExportData}
        onImportData={handleImportData}
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
