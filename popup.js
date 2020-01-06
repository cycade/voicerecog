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
recognition.onstart = function() {
  startButton.textContent = '中止识别';
  startButton.onclick = function() { recognition.stop(); status.textContent = '识别已中止'; }
  let copyButton = document.getElementById('copy');
  if (copyButton) { copyButton.remove(); }

  status.textContent = `识别中`;
}

recognition.onspeechend = function() {
  recognition.stop();
  status.textContent = `识别完成，请稍候，如长时间未响应请考虑重新输入`;
}

recognition.onerror = function(event) {
  recognition.stop();
  status.textContent = `识别错误: ${event.error}，请重试`;
}

recognition.onend = function(event) {
  startButton.textContent = '开始识别';
  startButton.onclick = startEvent;
}

recognition.onresult = function(event) {
  const last = event.results.length - 1;
  const result = event.results[last][0].transcript;
  
  status.textContent = `识别结果: ${result}`;

  chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
    const code = input => `(function setContent(input) {
      const autoFilled = !!localStorage.getItem('cursor');

      if (autoFilled) {
        document.querySelectorAll('input, textarea').forEach(e => {
          if (e.id === localStorage.getItem('cursor')) { e.value += input; }
        });
      }
    })('${input}');`

    chrome.tabs.executeScript(tabs[0].id, { code: code(result) }, () => {});
  })

  handleCopyButton(result);
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