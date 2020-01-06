chrome.runtime.onInstalled.addListener(function(details) {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        css: ['body'],
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });

  if (details.reason.search(/install/g) === -1) {
      return
  }
  chrome.tabs.create({
      url: chrome.extension.getURL("welcome.html"),
      active: true
  })
});