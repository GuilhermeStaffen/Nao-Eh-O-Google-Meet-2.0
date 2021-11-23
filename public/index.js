const socket = io('/');
const peer = new Peer();


let myVideoStream;
let myId;
var videoGrid = document.getElementById('videoDiv')
var myvideo = document.createElement('video');
myvideo.muted = true;
const peerConnections = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then((stream) => {
  myVideoStream = stream;
  addVideo(myvideo, stream);
  peer.on('call', call => {
    call.answer(stream);
    const vid = document.createElement('video');
    call.on('stream', userStream => {
      addVideo(vid, userStream);
    })
    call.on('error', (err) => {
      alert(err)
    })
    call.on("close", () => {
      vid.remove();
    })
    peerConnections[call.peer] = call;
  })
}).catch(err => {
  alert(err.message)
})

peer.on('open', (id) => {
  myId = id;
  socket.emit("newUser", id, roomID);
})

peer.on('error', (err) => {
  alert(err.type);
});

socket.on('userJoined', id => {
  const call = peer.call(id, myVideoStream);
  const vid = document.createElement('video');
  call.on('error', (err) => {
    alert(err);
  })
  call.on('stream', userStream => {
    addVideo(vid, userStream);
  })
  call.on('close', () => {
    vid.remove();
  })
  peerConnections[id] = call;
})

socket.on('userDisconnect', id => {
  if (peerConnections[id]) {
    peerConnections[id].close();
  }
})

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("backgroundRed");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("backgroundRed");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("backgroundRed");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("backgroundRed");
    stopVideo.innerHTML = html;
  }
});


function addVideo(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video);
}

async function getMeetCode() {
  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  const response = await fetch(urlAPI + "meetCode", requestOptions);
  const myJson = await response.json();

  window.alert(myJson.code)
}

async function getMeetUrl() {
  const meetInput = document.getElementById('meeturl');
  let response = await fetch('http://' + window.location.host + '/meetCode');
  let data = await response.json();
  meetInput.value = data.code
}

async function goToMeet() {
  const meetCode = document.getElementById('goToMeetInput');
  window.location = 'http://' + window.location.host + '/' + meetCode.value;
}

async function login() {
  const uname = document.getElementById('uname');
  const psw = document.getElementById('psw');
  if (uname.value == 'user1' && psw.value == '123') {
    sessionStorage.setItem('user', 'user1');
    window.location = window.location.href + 'mainScreen'
  }
  else if (uname.value == 'user2' && psw.value == '123') {
    sessionStorage.setItem('user', 'user2');
    window.location = window.location.href + 'mainScreen'
  }
  else if (uname.value == 'user3' && psw.value == '123') {
    sessionStorage.setItem('user', 'user3');
    window.location = window.location.href + 'mainScreen'
  }
  else {
    window.alert("usuário ou senha inválidos")
  }
}

