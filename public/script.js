
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  // path: '/peerjs',
  // host: '/',
  // port: '3000'
})

const user= prompt("Please Enter your name");
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    addNewUserToMyStream(userId, stream)
   
  })
  
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', MEETING_ID, id,user)
})

function addNewUserToMyStream(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    playMyVideo()
  } else {
    stopMyVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const htmlEle = `
    <i class="fas fa-microphone"></i>
    
  `
 
  document.querySelector('.mute_button').innerHTML = htmlEle;
}

const setUnmuteButton = () => {
  const htmlEle = `
    <i class="unmute fas fa-microphone-slash"></i>
   
  ` 
  document.querySelector('.mute_button').innerHTML = htmlEle;
}

const stopMyVideo = () => {
  const htmlEle = `
    <i class="fas fa-video"></i>
    
  `
 
  document.querySelector('.video_button').innerHTML = htmlEle;
}

const playMyVideo = () => {
  const htmlEle = `
  <i class="stop fas fa-video-slash"></i>

  `
  
  document.querySelector('.video_button').innerHTML = htmlEle;
}
const addParticipantsBtn=document.getElementById("invite")
addParticipantsBtn.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

const leave = ()=>{
  location.replace("/")

}
