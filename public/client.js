var socket = io();

var messages = document.querySelector('.chat');
var form = document.querySelector('form');
var input = document.querySelector('input');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('chat message', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

function username() {
    let text;
    let nickname = prompt("Name:", "");
    if (nickname == null || nickname == "") {
        text = "User cancelled the prompt.";
    } else {
        socket.emit('send-nickname', nickname);
    }
}

username();