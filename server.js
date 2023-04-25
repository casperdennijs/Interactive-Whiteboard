const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 4242;

const clients = {};

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(port, () => {
    console.log('listening on *:' + port);
});

const addClient = socket => {
    console.log("New client connected", socket.id);
    clients[socket.id] = socket;
};
const removeClient = socket => {
    console.log("Client disconnected", socket.id);
    delete clients[socket.id];
};

io.on('connection', (socket) => {
    socket.on('send-nickname', (nickname) => {
        socket.nickname = nickname;
        io.emit("send-nickname", socket.nickname);
    });
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        const time = new Date();
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const minutesConverted = ('0' + minutes).slice(-2)

        io.emit('chat message', "[" + hours + ":" + minutesConverted + "] " + socket.nickname + ": " + msg);
    });
});

io.on('connection', (socket) => {
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
});

io.on("connection", (socket) => {
    let id = socket.id;
  
    addClient(socket);
  
    socket.on("mousemove", data => {
      data.id = id;
      socket.broadcast.emit("moving", data);
    });
  
    socket.on("disconnect", () => {
      removeClient(socket);
      socket.broadcast.emit("clientdisconnect", id);
    });
});