
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  // path: '/peerjs',
  // host: '/',
  // port: '3000'
})


let user = sessionStorage.getItem('username');
if (user === null) {
    user = prompt("Please Enter your name");
}

if (user != null) {
    //storing username in session storage so that the prompt doesn't appear everytime we reload the page
    sessionStorage.setItem('username', user);
}
   
let myVideoStream;
//variable to toggle chat box in and out
let showChat = true;
let currentUserId = "null";
//html element to display the video of the meeting host
const myVideo = document.createElement('video')
myVideo.muted = true;   //the host is muted by default
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

//adding new user to the stream
  socket.on('user-connected', userId => {
    addNewUserToMyStream(userId, stream)
   
  })
  
  let text = $("input");
  
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });
  socket.on("createMessage", (message,username) => {
    $("ul").append(`<li class="message"><b> ${username===user?"You":username}</b><br/>${message}</li>`);
    scrollToBottom()
  })
})
// to disconnect a user from the stream
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
   
  socket.emit('join-room', MEETING_ID, id,user)
})
//function to connect to new user
function addNewUserToMyStream(userId, stream) {
  const call = myPeer.call(userId, stream)
  let video = document.createElement('video');
  video.className = sessionStorage.getItem('username')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => { 
      //remove the video of the user when he/she disconnects from the room
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
const scrollToBottom = () => {
  var d = $('.chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

//function to mute and unmute the user
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
//function to stop and play the video of the user
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

// function to enable user to leave the meeting
const leave = ()=>{
  location.replace("/");
}

//function to toggle chat box in and out
const toggleChat = () =>{
  var mr = document.getElementsByClassName("myContainer_right");
  var ml = document.getElementsByClassName("myContainer_left");
  if(showChat){
    ml[0].style.flex = "1";
    mr[0].style.display = "none";
    mr[0].style.transition = "display 0.3s";
    ml[0].style.transition = "flex 0.3s";
    document.getElementById('chat_icon').style.color = "white";
  }else{
    ml[0].style.flex = "0.8";
    mr[0].style.display = "flex";
    mr[0].style.transition = "display 0.3s";
    ml[0].style.transition = "flex 0.3s";
    document.getElementById('chat_icon').style.color = "#d73b3e";
    
  }
  showChat = !showChat;
 
}

