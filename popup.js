var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

const recognition = new SpeechRecognition();

recognition.lang = 'zh-Hans';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const status = document.querySelector('#status');
let result;

document.querySelector('#start').onclick = function() {
  recognition.stop();
  recognition.start();
}

recognition.onstart = function() {
  status.textContent = `识别中`;
}

recognition.onspeechend = function() {
  recognition.stop();
  status.textContent = `识别完成，请稍候`;
}

recognition.onerror = function(event) {
  recognition.stop();
  status.textContent = `识别错误: ${event.error}，请重试`;
}

recognition.onnomatch = function(event) {
  recognition.stop();
  status.textContent = `未识别到任何语音`;
}

recognition.onresult = function(event) {
  const last = event.results.length - 1, prevResult = result;
  result = event.results[last][0].transcript;

  status.textContent = `识别结果: ${result}`;

  chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
    const code = input => `(function setContent(input) {
      let autoFilled = !!localStorage.getItem('cursor');

      if (autoFilled) {
        autoFilled = false;
        document.querySelectorAll('input, textarea').forEach(e => {
          if (e.id === localStorage.getItem('cursor')) { e.value += input; autoFilled = true; }
        });
      }

      if (!autoFilled) {
        navigator.clipboard.writeText(input);
        alert('"' + input + '" 已复制到剪切板');
      }
    })('${input}');`

    chrome.tabs.executeScript(tabs[0].id, { code: code(result) }, () => {});
  })

  addCopyButton(result, prevResult);
}

function addCopyButton(result, prevResult) {
  if (result) {
    let copyButton;
    if (!prevResult) {
      copyButton = document.createElement('button');
      copyButton.id = 'copy';
    } else {
      copyButton = document.getElementById('copy');
    }

    copyButton.innerHTML = '复制当前内容';
    copyButton.onclick = function() {
      navigator.clipboard.writeText(result);
      copyButton.innerHTML = '已复制到剪贴板';
    }

    if (!prevResult) {
      document.getElementById('content').appendChild(copyButton);
    }
  }
}