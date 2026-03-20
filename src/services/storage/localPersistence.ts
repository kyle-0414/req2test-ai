export const localPersistence = {
  getItem: <T>(key: string): T | null => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
    }
    return null;
  },

  setItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error setting localStorage key "${key}":`, e);
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  }
};
