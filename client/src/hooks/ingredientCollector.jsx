import { useState, useEffect } from 'react';

export default function useItemCollector(key) {
  const [items, setItems] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setItems(JSON.parse(stored));
  }, [key]);

  // Add a new item
  const add = item => {
    const next = [...items, item];
    setItems(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  // Remove by index
  const remove = idx => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  // Clear all
  const clear = () => {
    setItems([]);
    localStorage.removeItem(key);
  };

  return { items, add, remove, clear };
}