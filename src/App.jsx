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

const DEFAULT_APP_SETTINGS = {
  openLinksInNewTab: false,
  showUpdateNotifications: true,
  showAddCardButton: true,
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
