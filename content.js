(function setCursorLocation() {
  document.querySelectorAll('input, textarea').forEach(e => {
    if (!e.id) { e.id = Math.random().toString(36).slice(-5); }
    const fn = e.onfocus;
    e.onfocus = event => {
      fn && fn(event);
      localStorage.setItem('cursor', e.id);
    }
  });
})();