import { useState, useEffect, useCallback } from 'react';

interface OfflineStorageState {
  isAvailable: boolean;
  isInitialized: boolean;
  storageSize: number;
  itemCount: number;
}

interface OfflineStorageActions {
  setItem: (key: string, value: any) => Promise<void>;
  getItem: (key: string) => Promise<any>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  getAllKeys: () => Promise<string[]>;
  getStorageInfo: () => Promise<{ size: number; count: number }>;
}

export function useOfflineStorage(): [OfflineStorageState, OfflineStorageActions] {
  const [state, setState] = useState<OfflineStorageState>({
    isAvailable: false,
    isInitialized: false,
    storageSize: 0,
    itemCount: 0
  });

  // Check IndexedDB availability
  useEffect(() => {
    const checkAvailability = async () => {
      if ('indexedDB' in window) {
        try {
          const db = await openDatabase();
          setState(prev => ({ 
            ...prev, 
            isAvailable: true, 
            isInitialized: true 
          }));
          
          // Get initial storage info
          const info = await getStorageInfo();
          setState(prev => ({ 
            ...prev, 
            storageSize: info.size, 
            itemCount: info.count 
          }));
        } catch (error) {
          console.error('IndexedDB initialization failed:', error);
        }
      }
    };

    checkAvailability();
  }, []);

  // Open IndexedDB database
  const openDatabase = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SquidJobOfflineStorage', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for different data types
        if (!db.objectStoreNames.contains('tenders')) {
          db.createObjectStore('tenders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('forms')) {
          db.createObjectStore('forms', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
      };
    });
  };

  // Get storage information
  const getStorageInfo = useCallback(async (): Promise<{ size: number; count: number }> => {
    try {
      const db = await openDatabase();
      let totalSize = 0;
      let totalCount = 0;

      const stores = ['tenders', 'forms', 'users', 'settings', 'cache', 'syncQueue'];
      
      for (const storeName of stores) {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const count = await new Promise<number>((resolve) => {
          const countRequest = store.count();
          countRequest.onsuccess = () => resolve(countRequest.result);
        });
        
        totalCount += count;
        
        // Estimate size (rough calculation)
        const getAllRequest = store.getAll();
        const items = await new Promise<any[]>((resolve) => {
          getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        });
        
        const size = JSON.stringify(items).length;
        totalSize += size;
      }

      return { size: totalSize, count: totalCount };
    } catch (error) {
      console.error('Get storage info failed:', error);
      return { size: 0, count: 0 };
    }
  }, []);

  // Set item in storage
  const setItem = useCallback(async (key: string, value: any): Promise<void> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ key, value, timestamp: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Update storage info
      const info = await getStorageInfo();
      setState(prev => ({ 
        ...prev, 
        storageSize: info.size, 
        itemCount: info.count 
      }));
    } catch (error) {
      console.error('Set item failed:', error);
      throw error;
    }
  }, [getStorageInfo]);

  // Get item from storage
  const getItem = useCallback(async (key: string): Promise<any> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      
      return await new Promise<any>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.value);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Get item failed:', error);
      return null;
    }
  }, []);

  // Remove item from storage
  const removeItem = useCallback(async (key: string): Promise<void> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Update storage info
      const info = await getStorageInfo();
      setState(prev => ({ 
        ...prev, 
        storageSize: info.size, 
        itemCount: info.count 
      }));
    } catch (error) {
      console.error('Remove item failed:', error);
      throw error;
    }
  }, [getStorageInfo]);

  // Clear all storage
  const clear = useCallback(async (): Promise<void> => {
    try {
      const db = await openDatabase();
      const stores = ['tenders', 'forms', 'users', 'settings', 'cache', 'syncQueue'];
      
      for (const storeName of stores) {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      setState(prev => ({ 
        ...prev, 
        storageSize: 0, 
        itemCount: 0 
      }));
    } catch (error) {
      console.error('Clear storage failed:', error);
      throw error;
    }
  }, []);

  // Get all keys
  const getAllKeys = useCallback(async (): Promise<string[]> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      
      return await new Promise<string[]>((resolve, reject) => {
        const request = store.getAllKeys();
        request.onsuccess = () => resolve(request.result as string[]);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Get all keys failed:', error);
      return [];
    }
  }, []);

  // Specialized storage functions for different data types
  const setTender = useCallback(async (tender: any): Promise<void> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['tenders'], 'readwrite');
      const store = transaction.objectStore('tenders');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ ...tender, timestamp: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Set tender failed:', error);
      throw error;
    }
  }, []);

  const getTender = useCallback(async (id: string): Promise<any> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['tenders'], 'readonly');
      const store = transaction.objectStore('tenders');
      
      return await new Promise<any>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Get tender failed:', error);
      return null;
    }
  }, []);

  const getAllTenders = useCallback(async (): Promise<any[]> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['tenders'], 'readonly');
      const store = transaction.objectStore('tenders');
      
      return await new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Get all tenders failed:', error);
      return [];
    }
  }, []);

  const addToSyncQueue = useCallback(async (item: any): Promise<void> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.add({
          ...item,
          id: Date.now().toString(),
          timestamp: Date.now(),
          retryCount: 0
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Add to sync queue failed:', error);
      throw error;
    }
  }, []);

  const getSyncQueue = useCallback(async (): Promise<any[]> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      
      return await new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Get sync queue failed:', error);
      return [];
    }
  }, []);

  const actions: OfflineStorageActions = {
    setItem,
    getItem,
    removeItem,
    clear,
    getAllKeys,
    getStorageInfo
  };

  return [state, actions];
} 