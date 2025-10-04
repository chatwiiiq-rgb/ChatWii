import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>('light');

  return {
    subscribe,
    init: () => {
      if (browser) {
        const stored = localStorage.getItem('theme') as Theme | null;
        const theme = stored || 'light';

        // Apply theme to DOM
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        set(theme);
      }
    },
    toggle: () => {
      if (browser) {
        update((current) => {
          const newTheme: Theme = current === 'light' ? 'dark' : 'light';

          // Update localStorage
          localStorage.setItem('theme', newTheme);

          // Update DOM
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          return newTheme;
        });
      }
    },
  };
}

export const themeStore = createThemeStore();
