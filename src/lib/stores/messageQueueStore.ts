import { writable, get } from 'svelte/store';
import { isOnline } from './connectionStore';
import type { SendMessageParams } from '$lib/services/messageService';

interface QueuedMessage extends SendMessageParams {
  id: string;
  timestamp: number;
  retryCount: number;
}

function createMessageQueueStore() {
  const { subscribe, update, set } = writable<QueuedMessage[]>([]);

  // Try to send queued messages when coming back online
  isOnline.subscribe((online) => {
    if (online) {
      const queue = get({ subscribe });
      if (queue.length > 0) {
        console.log(`Attempting to send ${queue.length} queued messages`);
      }
    }
  });

  return {
    subscribe,
    enqueue: (params: SendMessageParams) => {
      const queuedMessage: QueuedMessage = {
        ...params,
        id: `queued-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        retryCount: 0,
      };

      update((queue) => [...queue, queuedMessage]);
      return queuedMessage.id;
    },
    dequeue: (id: string) => {
      update((queue) => queue.filter((msg) => msg.id !== id));
    },
    incrementRetry: (id: string) => {
      update((queue) =>
        queue.map((msg) => (msg.id === id ? { ...msg, retryCount: msg.retryCount + 1 } : msg))
      );
    },
    getQueue: () => get({ subscribe }),
    clear: () => set([]),
    size: () => get({ subscribe }).length,
  };
}

export const messageQueueStore = createMessageQueueStore();
