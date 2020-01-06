(function setCursorLocation() {
  function storeNodeId(node) {
    if (!node.id) { node.id = Math.random().toString(36).slice(-5); }
    localStorage.setItem('cursor', node.id);
  }

  function addTrackNodeListener(node) {
    const focusFn = node.onfocus;
    node.onfocus = event => { focusFn && focusFn(event); storeNodeId(node); }
  }

  document.querySelectorAll('input, textarea').forEach(e => {
    addTrackNodeListener(e);
  });

  const onInputAdded = (mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(e => {
        if (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') {
          addTrackNodeListener(e);
        }
      });
    })
  }

  let observer = new MutationObserver(onInputAdded);
  observer.observe(document.querySelector('body'), { childList: true, subtree: true });
})();