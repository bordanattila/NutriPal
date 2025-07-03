import { useState, useEffect } from 'react';

export default function useItemCollector(key) {
  const [items, setItems] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setItems(JSON.parse(stored));
  }, [key]);

  // Add a new item 
  const add = (item) => {
    setItems(prev => {
      const next = [...prev, item];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  // Remove by index
  const remove = (idx) => {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== idx);
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  // Clear all
  const clear = () => {
    setItems([]);
    localStorage.removeItem(key);
  };

  return { items, add, remove, clear };
}