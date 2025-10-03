import { writable, derived } from 'svelte/store';

export type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

interface ConnectionState {
  status: ConnectionStatus;
  lastOnline: Date | null;
  reconnectAttempts: number;
}

function createConnectionStore() {
  const { subscribe, set, update } = writable<ConnectionState>({
    status: 'online',
    lastOnline: null,
    reconnectAttempts: 0,
  });

  // Listen to browser online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      update((state) => ({ ...state, status: 'online', reconnectAttempts: 0 }));
    });

    window.addEventListener('offline', () => {
      update((state) => ({
        ...state,
        status: 'offline',
        lastOnline: new Date(),
      }));
    });

    // Set initial status
    if (!navigator.onLine) {
      update((state) => ({ ...state, status: 'offline', lastOnline: new Date() }));
    }
  }

  return {
    subscribe,
    setStatus: (status: ConnectionStatus) => {
      update((state) => ({
        ...state,
        status,
        lastOnline: status === 'offline' ? new Date() : state.lastOnline,
      }));
    },
    setReconnecting: () => {
      update((state) => ({
        ...state,
        status: 'reconnecting',
        reconnectAttempts: state.reconnectAttempts + 1,
      }));
    },
    setOnline: () => {
      update((state) => ({ ...state, status: 'online', reconnectAttempts: 0 }));
    },
    setOffline: () => {
      update((state) => ({
        ...state,
        status: 'offline',
        lastOnline: new Date(),
      }));
    },
  };
}

export const connectionStore = createConnectionStore();

// Derived store for connection status
export const isOnline = derived(connectionStore, ($connection) => $connection.status === 'online');
export const isOffline = derived(
  connectionStore,
  ($connection) => $connection.status === 'offline'
);
export const isReconnecting = derived(
  connectionStore,
  ($connection) => $connection.status === 'reconnecting'
);
