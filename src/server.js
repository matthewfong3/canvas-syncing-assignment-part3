const fs = require('fs');
const http = require('http');
const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (req, res) => {
  fs.readFile(`${__dirname}/../client/index.html`, (err, data) => {
    if (err) throw err;

    res.writeHead(200);
    res.end(data);
  });
};

const app = http.createServer(onRequest);

app.listen(port);

console.log(`listening on 127.0.0.1: ${port}`);

const io = socketio(app);

const clientObjects = {};

io.on('connection', (socket) => {
  socket.join('room1');
  
  socket.on('updateOnServer', (data) => {
    if (!clientObjects[data.user]) {
      clientObjects[data.user] = data.coords;
    } else if (clientObjects[data.user].lastUpdate < data.coords.lastUpdate) {
      clientObjects[data.user].coords = data.coords;
    }

    io.sockets.in('room1').emit('updateOnClient', { user: data.user, coords: data.coords });
  });

  socket.on('disconnect', () => {
    socket.leave('room1');
  });
});

console.log('Websocket server started');
