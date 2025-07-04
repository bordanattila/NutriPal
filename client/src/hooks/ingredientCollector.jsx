/**
 * @file ingredientCollector.jsx
 * @module useItemCollector
 * @description
 *   A custom React hook to manage a list of items persisted in localStorage.
 *   Provides methods to add, remove, and clear items, while keeping
 *   both React state and localStorage in sync.
 *
 * @param {string} key - The localStorage key under which items are stored.
 * @returns {{ items: any[], add: Function, remove: Function, clear: Function }}
 *   - items: Current array of stored items.
 *   - add: Function to append a new item.
 *   - remove: Function to remove an item by index.
 *   - clear: Function to remove all items and clear storage.
 */
export default function useItemCollector(key) {
  // React state to hold the list of items
  const [items, setItems] = useState([]);

  /**
   * Load initial items from localStorage on first render (or when key changes)
   */
  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error(`Failed to parse stored items for key "${key}":`, e);
        localStorage.removeItem(key); // corrupt data, clear it
      }
    }
  }, [key]);

  /**
   * Append a new item to the list and persist to localStorage
   * @param {any} item - The item to add to the list.
   */
  const add = (item) => {
    setItems(prev => {
      const next = [...prev, item];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  /**
   * Remove an item by its index in the array and update storage
   * @param {number} idx - Index of the item to remove.
   */
  const remove = (idx) => {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== idx);
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  /**
   * Clear all items and remove the storage key
   */
  const clear = () => {
    setItems([]);
    localStorage.removeItem(key);
  };

  // Expose the state and helper functions
  return { items, add, remove, clear };
}
