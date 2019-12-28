let changeColor = document.getElementById('changeColor');
let videoElement = document.querySelector('video');

function fetchIntoElement(method, url, selector, loadingText) {
  let xhr = new XMLHttpRequest(), targetComponent = document.querySelector(selector);

  if (loadingText) { targetComponent.innerHTML = loadingText; }

  xhr.open(method, url, true);
  xhr.onreadystatechange = function() {
    targetComponent.innerHTML = xhr.responseText.length;
  }
  xhr.send();
}

chrome.storage.sync.get('color', function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
})

changeColor.onclick = function(element) {
  let color = element.target.value;
  const url = 'https://psmapi.lcquest.com/api/v1/records';

  fetchIntoElement('GET', url, '#res', 'loading');
  
  chrome.tabCapture.capture({audio: true}, stream => {
    let startTabId;
    chrome.tabs.query({active: true, currentWindow: true}, tabs => startTabId = tabs[0].id);
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const streamBlock = document.getElementById('stream');
    streamBlock.innerHTML = source;

    videoElement.srcObject = stream;
    videoElement.onloadedmetadata = e => { videoElement.play(); }
  })  
  
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      { code: `document.body.style.backgroundColor = "${color}";` }
    );
  });
}

