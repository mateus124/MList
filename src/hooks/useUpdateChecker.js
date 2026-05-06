import { useEffect, useState } from 'react';

export const RELEASES_API_URL = 'https://api.github.com/repos/mateus124/MList/releases/latest';
export const RELEASES_PAGE_URL = 'https://github.com/mateus124/MList/releases/latest';
const UPDATE_NOTICE_AUTO_DISMISS_MS = 5000;

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

const useUpdateChecker = ({ enabled, isSettingsLoaded, dismissedVersion }) => {
  const [appVersion, setAppVersion] = useState(getCurrentAppVersion);
  const [availableUpdateVersion, setAvailableUpdateVersion] = useState(null);

  useEffect(() => {
    setAppVersion(getCurrentAppVersion());
  }, []);

  useEffect(() => {
    if (!isSettingsLoaded || !enabled) {
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

        if (dismissedVersion === latestVersion) {
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
  }, [dismissedVersion, enabled, isSettingsLoaded]);

  useEffect(() => {
    if (!availableUpdateVersion) return;

    const timeoutId = window.setTimeout(() => {
      setAvailableUpdateVersion(null);
    }, UPDATE_NOTICE_AUTO_DISMISS_MS);

    return () => window.clearTimeout(timeoutId);
  }, [availableUpdateVersion]);

  const dismissUpdateNotice = () => {
    setAvailableUpdateVersion(null);
  };

  return {
    appVersion,
    availableUpdateVersion,
    dismissUpdateNotice,
  };
};

export default useUpdateChecker;
