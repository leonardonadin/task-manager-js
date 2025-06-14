const shortcuts = new Map();

export const registerShortcut = (key, callback, description) => {
  shortcuts.set(key, { callback, description });
};

export const unregisterShortcut = key => {
  shortcuts.delete(key);
};

export const getShortcuts = () => {
  return Array.from(shortcuts.entries()).map(([key, { description }]) => ({
    key,
    description,
  }));
};

export const handleKeyPress = event => {
  const key = event.key.toLowerCase();
  const ctrlKey = event.ctrlKey || event.metaKey;
  const shiftKey = event.shiftKey;
  const altKey = event.altKey;

  const shortcutKey = `${ctrlKey ? 'ctrl+' : ''}${shiftKey ? 'shift+' : ''}${altKey ? 'alt+' : ''}${key}`;
  const shortcut = shortcuts.get(shortcutKey);

  if (shortcut) {
    event.preventDefault();
    shortcut.callback();
  }
};

// Register global keyboard event listener
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeyPress);
}
