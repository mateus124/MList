const DB_NAME = 'mlist-theme-images';
const DB_VERSION = 1;
const STORE_NAME = 'images';

const openThemeImageDatabase = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export const saveThemeImage = async (id, blob) => {
  const database = await openThemeImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, blob, updatedAt: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
};

export const getThemeImage = async (id) => {
  const database = await openThemeImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
};

export const deleteThemeImage = async (id) => {
  const database = await openThemeImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
};