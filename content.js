(function setCursorLocation() {
  document.querySelectorAll('input, textarea').forEach(e => {
    if (!e.id) { e.id = Math.random().toString(36).slice(-5); }
    const fn = e.onfocus;
    e.onfocus = event => {
      fn && fn(event);
      localStorage.setItem('cursor', e.id);
    }
  });

  const onInputAdded = (mutations) => {
    mutations.forEach(f => {
      f.addedNodes.forEach(e => {
        if (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') {
          if (!e.id) { e.id = Math.random().toString(36).slice(-5); }
          const fn = e.onfocus;
          e.onfocus = event => {
            fn && fn(event);
            localStorage.setItem('cursor', e.id);
          }
        }
      });
    })
  }

  let observer = new MutationObserver(onInputAdded);
  observer.observe(document.querySelector('body'), { childList: true, subtree: true });
})();