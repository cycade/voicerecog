function fetchIntoElement(method, { url, params }, elementSelector, loadingText, contentSelector) {
  const targetComponent = document.querySelector(elementSelector);
  if (loadingText) { targetComponent.innerHTML = loadingText; }

  return fetch(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: params ? JSON.stringify(params) : undefined,
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      targetComponent.innerHTML = contentSelector(data);
    })
}





const videoElement = document.querySelector('video');
const startButton = document.querySelector('#start');
const stopButton = document.querySelector('#stop');

function createAudioDownloadElement(bloburl) {
  const downloadElement = document.createElement('a');
  downloadElement.style = 'display: block';
  downloadElement.innerHTML = 'download';
  downloadElement.download = 'audio.wav';
  downloadElement.href = bloburl;
  document.body.appendChild(downloadElement);
}

navigator.mediaDevices.getUserMedia({audio: true, video: false})
  .then(stream => {
    let audioChunks = [], recorder = new MediaRecorder(stream);

    function startRecording() {
      if (!videoElement.srcObject && stream) {
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = e => {
          videoElement.play();
        }  
      } else if (!videoElement.srcObject) {
        console.log('cannot start recording because streaming has closed');
      }
      
      recorder.start();
      console.log('recorder has been started');
    }

    function stopRecording() {
      recorder.stop();
      videoElement.srcObject = null;
    }

    function quitStreaming() {
      let tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoElement.srcObject = null;          
    }

    startButton.addEventListener('click', startRecording);
    stopButton.addEventListener('click', stopRecording);

    recorder.ondataavailable = e => {
      audioChunks.push(e.data);
    }

    recorder.onstop = e => {
      let blob = new Blob(audioChunks, { 'type' : 'audio/wav; codecs=MS_PCM' });
      audioChunks = [];

      let bloburl = URL.createObjectURL(blob);
      createAudioDownloadElement(bloburl);

      let reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = function() {
        let base64data = reader.result.split(',')[1];

        const requestOption = {
          url: 'http://localhost:3001' || 'recogi.herokuapp.com',
          params: {
            content: base64data,
          }
        }

        fetchIntoElement('POST', requestOption, '#video-result', 'loading',
          data => data.result.length ? data.result : '您什么都没说');
      }

      console.log('recorder has been stopped');
    }
  }).catch(err => {
    console.error(err);
  })