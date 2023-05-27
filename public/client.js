var socket = io();

var messages = document.querySelector('.chat-messages');
var form = document.querySelector('#chat-form');
var input = document.querySelector('#chat-form input');
var warning = document.querySelector('.warn')

let messageHistory = [];

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('chat message', function(msg) {
    addMessage(msg);
    messageHistory.push({timeMsg: msg.timeMsg, username: msg.username, msg: msg.msg});
});

socket.on('gif message', function(gif) {
    addGif(gif);
    messageHistory.push({timeMsg: msg.timeMsg, username: msg.username, msg: gif.gif});
});

socket.on('history', (history) => {
    messageHistory = history;
    messageHistory.forEach((msg) => {
        addMessage(msg)
    });
});

function addMessage(msg) {
    var item = document.createElement('li');
    item.textContent = msg.timeMsg + msg.username + ": " + msg.msg;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
}

function addGif(gif) {
    var item = document.createElement('li');
    var img = document.createElement('img');
    item.textContent = gif.timeMsg + gif.username + ":";
    img.src = "https://i.giphy.com/media/" + gif.gif + "/giphy.webp";
    messages.appendChild(item);
    messages.appendChild(img);
    messages.scrollTop = messages.scrollHeight;
}

function username() {
    let text;
    let nickname = prompt("Name:", "");
    if (nickname == null || nickname == "") {
        text = "User cancelled the prompt.";
    } else {
        socket.emit('send-nickname', nickname);
    }
}

function checkOffline() {
    if (socket.connected) {
        console.log("Online")
        warning.classList.remove("offline");
    } else {
        console.log("Offline")
        warning.classList.add("offline");
    }
}
setInterval(checkOffline, 5000);

username();