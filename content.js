(function setCursorLocation() {
  document.querySelectorAll('input, textarea').forEach(e => {
    if (!e.id) { e.id = Math.random().toString(36).slice(-5); }
    e.onfocus = () => localStorage.setItem('cursor', e.id);
  });
})();