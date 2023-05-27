require('dotenv').config()
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
      origin: "https://wb.up.railway.app",
      // or with an array of origins
      // origin: ["https://my-frontend.com", "https://my-other-frontend.com", "http://localhost:3000"],
      credentials: true
    }
});
const port = process.env.PORT || 4242;

const clients = {};

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(port, () => {
    console.log('listening on *:' + port);
});

const historySize = 50
let history = []

const addClient = socket => {
    console.log("New client connected", socket.id);
    clients[socket.id] = socket;
    socket.emit('history', history);
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

    socket.on('chat message', (msg) => {
        const time = new Date();
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const minutesConverted = ('0' + minutes).slice(-2)
        const timeMsg = "[" + hours + ":" + minutesConverted + "] "

        while (history.length > historySize) {
            history.shift();
        }
        history.push({timeMsg: timeMsg, username: socket.nickname, msg: msg});

        if (msg === "/giphy") {
            const url = "https://api.giphy.com/v1/gifs/random?api_key=" + process.env.API_KEY + "&tag=&rating=g";
            fetch(url)
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    console.log(data.data.id);
                    io.emit('gif message', {timeMsg: timeMsg, username: socket.nickname, gif: data.data.id}); 
                })
        } else {
            io.emit('chat message', {timeMsg: timeMsg, username: socket.nickname, msg: msg});
        }
    });

    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

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