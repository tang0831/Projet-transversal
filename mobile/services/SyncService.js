import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const SYNC_QUEUE_KEY = '@sync_queue';

export const SyncService = {
  // Ajouter une opération à la file locale
  enqueue: async (endpoint, method, data) => {
    try {
      const queue = await SyncService.getQueue();
      const newItem = {
        id: Date.now().toString(),
        endpoint,
        method,
        data,
        timestamp: new Date().toISOString()
      };
      queue.push(newItem);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      console.log('[SyncService] Opération stockée localement (Offline):', newItem);
      return true;
    } catch (e) {
      console.error('[SyncService] Erreur stockage local:', e);
      return false;
    }
  },

  // Récupérer la file
  getQueue: async () => {
    try {
      const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (e) {
      return [];
    }
  },

  // Tenter de synchroniser la file vers le serveur
  processQueue: async () => {
    const queue = await SyncService.getQueue();
    if (queue.length === 0) return;

    console.log(`[SyncService] Tentative de synchro de ${queue.length} éléments...`);
    const remainingQueue = [];

    for (const item of queue) {
      try {
        await api({
          url: item.endpoint,
          method: item.method,
          data: item.data
        });
        console.log(`[SyncService] Succès synchro pour item ${item.id}`);
      } catch (e) {
        console.log(`[SyncService] Échec synchro pour item ${item.id}, reste en file.`);
        remainingQueue.push(item);
      }
    }

    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));
    return remainingQueue.length === 0;
  }
};
