const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/',(req,res)=>{
    res.render("landing");
  })
app.get('/meeting', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('meeting', { meetingId: req.params.room })
})
io.on('connection', socket => {
    socket.on('join-room', (meetingId, userId,username) => {
      socket.join(meetingId)
      socket.to(meetingId).emit('user-connected', userId);
  
      socket.on('message', (message,userId) => {
  
        io.to(meetingId).emit('createMessage', message,username)
    }); 
  
      socket.on('disconnect', () => {
        socket.to(meetingId).emit('user-disconnected', userId)
      })
    })
  })
  

server.listen(process.env.PORT||3000)