var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = 'zh-Hans';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// init start button
const startButton = document.querySelector('#start');
const status = document.querySelector('#status');
const startEvent = function() {
  recognition.stop();
  recognition.start();
}
startButton.onclick = startEvent;

// lifecycle of recognition
const recognitionStatus = {
  start: '开始识别',
  receiving: '',
  received: '接收完毕，请稍候',
  recognizing: '识别中',

  abort: '识别已中止',
  emptyContent: '未收到输入，请重试',
  success: result => `识别结果: ${result}`,
  failed: event => `识别错误: ${event.error}，请重试`,
}

recognition.onstart = function() {
  startButton.textContent = '中止识别';
  startButton.onclick = function() { recognition.stop(); status.textContent = recognitionStatus.abort; }
  let copyButton = document.getElementById('copy');
  if (copyButton) { copyButton.remove(); }

  status.textContent = recognitionStatus.recognizing;
}

recognition.onspeechend = function() {
  recognition.stop();
  status.textContent = recognitionStatus.received;
  startButton.disabled = true;
  setTimeout(() => {
    if (status.textContent === recognitionStatus.received) {
      status.textContent = recognitionStatus.emptyContent;
      startButton.disabled = false;
    }
  }, 3500);
}

recognition.onerror = function(event) {
  recognition.stop();
  status.textContent = recognitionStatus.failed(event);
}

recognition.onend = function(event) {
  startButton.textContent = '开始识别';
  startButton.onclick = startEvent;
}

recognition.onresult = function(event) {
  const last = event.results.length - 1;
  const result = event.results[last][0].transcript;
  
  status.textContent = recognitionStatus.success(result);

  chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
    const code = input => `(function setContent(input) {
      if (localStorage.getItem('cursor')) {
        document.querySelectorAll('input, textarea').forEach(e => {
          if (e.id === localStorage.getItem('cursor')) { e.value += input; }
        });
      }
    })('${input}');`

    chrome.tabs.executeScript(tabs[0].id, { code: code(result) }, () => {});
  })

  handleCopyButton(result);
  startButton.disabled = false;
}

function handleCopyButton(result) {
  if (result && result.length) {
    let copyButton = document.getElementById('copy'), hasCopyButton = !!copyButton;
    if (!hasCopyButton) {
      copyButton = document.createElement('button');
      copyButton.id = 'copy';
      copyButton.innerHTML = '复制当前内容';
    }

    copyButton.onclick = function() {
      navigator.clipboard.writeText(result);
      copyButton.innerHTML = '已复制到剪贴板';
    }

    if (!hasCopyButton) {
      document.getElementById('content').appendChild(copyButton);
    }
  }
}