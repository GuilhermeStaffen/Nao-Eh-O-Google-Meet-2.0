const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 4000;
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer')
const peer = ExpressPeerServer(server, {
  debug: true
});


app.use(express.static(__dirname + '/public'));
app.use('/peerjs', peer);
app.set('view engine', 'ejs')

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
      'Access-Control-Allow-Header',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).send({});
  }
  next();
});

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/meetCode', (req, res) => {
  res.status(200).send({ code: uuidv4() });
});

app.get('/mainScreen', (req, res) => {
  res.render('main');
});

app.get('/:room', (req, res) => {
  res.render('meet', { RoomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on('newUser', (id, room) => {
    socket.join(room);
    socket.to(room).broadcast.emit('userJoined', id);
    socket.on('disconnect', () => {
      socket.to(room).broadcast.emit('userDisconnect', id);
    })
  })
})

server.listen(port, () => {
  console.log("Server running on port : " + port);
})
