import { useState, useEffect } from 'react';

const useLocalStorage = (key, initialValue = []) => {
    const [data, setData] = useState(initialValue);
    const [isLoaded, setIsLoaded] = useState(false);

    const hasChromeStorage =
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        chrome.storage.local;

    useEffect(() => {
        const loadFromStorage = async () => {
            try {
                if (hasChromeStorage) {
                    const result = await chrome.storage.local.get([key]);
                    if (result[key]) {
                        setData(result[key]);
                    }
                    return;
                }

                const localData = window.localStorage.getItem(key);
                if (localData) {
                    setData(JSON.parse(localData));
                }
            } catch (error) {
                console.error('Erro ao carregar dados do storage:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadFromStorage();
    }, [key, hasChromeStorage]);

    const saveToStorage = async (newData) => {
        setData(newData);

        try {
            if (hasChromeStorage) {
                await chrome.storage.local.set({ [key]: newData });
                return;
            }

            window.localStorage.setItem(key, JSON.stringify(newData));
        } catch (error) {
            console.error('Erro ao salvar dados no storage:', error);
        }
    };

    const removeFromStorage = async () => {
        setData(initialValue);

        try {
            if (hasChromeStorage) {
                await chrome.storage.local.remove([key]);
                return;
            }

            window.localStorage.removeItem(key);
        } catch (error) {
            console.error('Erro ao remover dados do storage:', error);
        }
    };

    return { data, saveToStorage, removeFromStorage, isLoaded };
};

export default useLocalStorage;
