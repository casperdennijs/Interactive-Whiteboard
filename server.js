const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 4242;

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(port, () => {
    console.log('listening on *:' + port);
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

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