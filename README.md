# Interactive Whiteboard (Real Time Web)
![iw logo](https://github.com/casperdennijs/Interactive-Whiteboard/assets/56598338/15e7664e-6882-443d-8207-d75a0d2f59ea)

## Inhoudsopgave
- Introductie
- Features
- Installeren
- Het proces
- Applicatie
- Todo
- Bronnen

## Introductie
Voor het vak Real Time Web ben ik bezig geweest met maken van een Node JS applicatie die realtime te gebruiken is doormiddel van sockets. Ik heb ervoor gekozen om naast de standaard bare bone chat ook een teken canvas te maken waar mensen gezamenlijk bezig kunnen zijn. Gedurende dit vak ga ik meer leren hoe ik websockets kan toepassen en zo een realtime applicatie te kunnen bouwen.

## Features
- Tekenen met andere mensen en hun cursors kunnen zien
- Kleur en dikte bepalen van je cursor (zien andere ook)
- Kunnen chatten met de andere
- Je kunt willekeurige gif's sturen door /giphy te typen (doormiddel van de Giphy API)
- Offline waarschuwingspopup

## Installeren
Het project kan je installeren door allereerst de repository te clonen van GitHub, dit doe je door de onderstaande commando's uit te voeren.

```
https://github.com/casperdennijs/Interactive-Whiteboard.git
```

Vervolgens moet je alle dependencies downloaden die niet gecommit worden naar GitHub

```
npm install
```

En als laatst kan je dan de applicatie opstarten doormiddel van

```
npm run start
```

## Het proces
Aan het begin van het proces ben ik begonnen met het maken van een simpele chat applicatie, hiervoor heb ik de get started van socket.io gebruikt

https://socket.io/get-started/chat

Na die te hebben gebouwd ben ik gaan kijken naar wat ik wil bouwen en ben toen eerst op het idee gekomen om https://skribbl.io/ na te gaan maken, hiervoor ben ik eerst gestart met de canvas element en hoe ik deze wil delen doormiddel van sockets. Hierbij kwam ik op een demo uit die ook op de socket.io website staat

https://socket.io/demos/whiteboard/

Als eerst wou ik een eigen API maken waarin ik woorden kan opslaan die vervolgens gebruikt kunnen worden in de game aspect, maar na een tijdje kwam ik er al vrij snel achter dat heel veel meer complex en tijd ging kosten dan dat ik hoopte en heb toen gekozen om de skribbl.io idee te schrappen en verder te gaan met een algemeen whiteboard die ik interactiever wil maken.

Omdat ik nog wel een API nodig had voor de applicatie heb ik gekozen om de Giphy API te gaan gebruiken. Door de command /giphy uit te voeren in chat krijg je nu volledig willekeurige gif's afkomstig van Giphy.

https://api.giphy.com/v1/gifs/random

### Data model API
![iw data model api](https://github.com/casperdennijs/Interactive-Whiteboard/assets/56598338/b3887f5c-3ec8-4d43-81ce-32170f68c8dc)

### Data flow diagram
```
                                 ┌────────────┐
                                 │            │
                                 │ Giphy API  │
                                 │            │
                                 └─────┬──────┘
                                       │
                                       │
                                       │
                                       │  GET random gif
                                       │
                                       │
                                       │
┌────────────┐ Connect           ┌─────▼──────┐
│            │ ────────────────► │            │
│            │                   │            │
│            │ User join         │            │
│            │ ◄──────────────── │            │
│            │                   │            │
│            │ Disconnect        │            │
│            │ ────────────────► │            │
│            │                   │            │
│            │ User leave        │            │
│            │ ◄──────────────── │            │
│   Client   │                   │   Server   │
│            │ Drawing           │            │
│            │ ────────────────► │            │
│            │                   │            │
│            │ Update canvas     │            │
│            │ ◄──────────────── │            │
│            │                   │            │
│            │ Sends message/gif │            │
│            │ ────────────────► │            │
│            │                   │            │
│            │ Update chat       │            │
└────────────┘ ◄──────────────── └────────────┘
```
Een voorbeeld van een json output van de API ziet er als volgt uit:
![image](https://github.com/casperdennijs/Interactive-Whiteboard/assets/56598338/012de668-5b65-4aa5-b9ce-c1d37ca4724a)

Afbeelding is wat korter afgeknipt omdat er onder images een heleboel verschillende formaten staan van dezelfde images, bijvoorbeeld downsized, original, fixed height/width. Maar ook in verschillende bestands formaten zoals webp, gif en mp4. Omdat ik deze niet heb gebruikt en alleen hun id overneem leken deze me minder van toepassen.

## Applicatie
Mijn applicatie is een Node JS applicatie. Daarnaast gebruik ik express, socket.io en node-fetch om nodige andere features werkend te kunnen krijgen. Hieronder ga ik over belangrijke stukken code uitleggen wat ze doen en waarom ze nodig zijn.

### Server side
#### Express
Als allereerst hebben we express nodig om de server te kunnen laten draaien, hiervoor heb ik vrij standaard code gebruikt en niet heel bijzonderheden eraan toegevoegd. Aangezien ik ook alles in een single page heb gebouwd heb ik gekozen om geen templating engine zoals handlebars of ejs te gebruiken. Met deze code zorg ik ervoor dat express gedraaid wordt bij node start en dat dit gebeurd op port 4242. Daarnaast heb ik ervoor gezorgd dat de public folder gebruikt kan worden en dat index.html die hoofdpagina is.
```JS
const express = require('express');
const app = express();

const port = process.env.PORT || 4242;

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(port, () => {
    console.log('listening on *:' + port);
});
```

#### Socket.io
Voor socket.io heb ik een heel wat meer moeten opzetten aan de server side. Het connecten/disconnecten van gebruikers, chat messages en het versturen van gifs, gifs die doormiddel van fetching opgehaald worden en alle muisbewegingen wanneer er getekend wordt waarbij de canvas geupdate moet worden voor iedereen.
```JS
const historySize = 50
let history = []

// Voegt een gebruiker toe aan de lijst bij connect
const addClient = socket => {
    console.log("New client connected", socket.id);
    clients[socket.id] = socket;
    socket.emit('history', history);
};
// Verwijderd een gebruiker uit de lijst bij disconnect
const removeClient = socket => {
    console.log("Client disconnected", socket.id);
    delete clients[socket.id];
};

// Alle logica die uitgevoerd moeten worden bij een connectie
io.on('connection', (socket) => {
    // De nickname die de gebruiker heeft aangegeven aan het begin word hier meegenomen
    socket.on('send-nickname', (nickname) => {
        socket.nickname = nickname;
        io.emit("send-nickname", socket.nickname);
    });
    
    // Hier worden de chat messages netjes geformateerd en gekeken of /giphy gebruikt wordt
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
            const url = "https://api.giphy.com/v1/gifs/random?api_key=giv4hiAN7jhHNgdvONNAxFSXT67jScXY&tag=&rating=g";
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
    
    // Hier word er gekeken of een gebruiker aan het tekenen is
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
```

#### Node-fetch
Ik heb de npm package Node-fetch gebruikt om server sided de API data op te halen die vervolgens naar iedereen mee gestuurd wordt om ervoor te zorgen dat de gif in chat te zien zal zijn. Ik hiervoor een kleine standaard fetch gebruikt waarbij ik alle data ophaal en dan alleen de id meegeef naar de client side.
```JS
const url = "https://api.giphy.com/v1/gifs/random?api_key=giv4hiAN7jhHNgdvONNAxFSXT67jScXY&tag=&rating=g";
    fetch(url)
      .then(response => {
          return response.json();
      })
      .then(data => {
          console.log(data.data.id);
          io.emit('gif message', {timeMsg: timeMsg, username: socket.nickname, gif: data.data.id}); 
      })
```

### Client side
#### client.js
In dit bestand begin ik allereerst met het aanroepen van socket en een aantal variabelen aan te maken.
```JS
var socket = io();

var messages = document.querySelector('.chat-messages');
var form = document.querySelector('#chat-form');
var input = document.querySelector('#chat-form input');
var warning = document.querySelector('.warn')

let messageHistory = [];
```

Vervolgens ben ik bezig geweest met de logica van de chat functies, zoals het versturen, opslaan en het oproepen van oude berichten bij pagina binnenkomst
```JS
// Event voor het versturen van een bericht
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

// Verstuurde bericht aanmaken en meenemen in de chatgeschiedenis
socket.on('chat message', function(msg) {
    addMessage(msg);
    messageHistory.push({timeMsg: msg.timeMsg, username: msg.username, msg: msg.msg});
});

// Verstuurde gif aanmaken en meenemen in de chatgeschiedenis (gif wordt niet getoond in geschiedenis, maar je ziet dan /giphy in chat)
socket.on('gif message', function(gif) {
    addGif(gif);
    messageHistory.push({timeMsg: msg.timeMsg, username: msg.username, msg: gif.gif});
});

// Alle opgeslagen berichten bij binnenkomst in de chat weergeven (max 50 berichten)
socket.on('history', (history) => {
    messageHistory = history;
    messageHistory.forEach((msg) => {
        addMessage(msg)
    });
});

// Functie die de berichten aan de voorkant laten tonen
function addMessage(msg) {
    var item = document.createElement('li');
    item.textContent = msg.timeMsg + msg.username + ": " + msg.msg;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
}

// Functie die gifs aan de voorkant laten tonen
function addGif(gif) {
    var item = document.createElement('li');
    var img = document.createElement('img');
    item.textContent = gif.timeMsg + gif.username + ":";
    img.src = "https://i.giphy.com/media/" + gif.gif + "/giphy.webp";
    messages.appendChild(item);
    messages.appendChild(img);
    messages.scrollTop = messages.scrollHeight;
}
```

Ook vraag ik bij binnenkomst van de website eerst naar een nickname, hiermee kunnen mensen zichzelf mee identificeren in de chat. Dit heb ik gedaan doormiddel van een prompt met een invoerveld.
```JS
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
```

En kijk ik of een socket connectie nog levend is, dit heeft voornamelijk met iemand zijn internet te maken. Wanneer iemand geen connectie meer heeft komt een waarschuwing naar voren die pas weer weggaat wanneer de connectie hersteld is. Deze functie wordt elke 5 seconden aangeroepen om te kijken naar de connectie.
```JS
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
```

#### sketch.js (bron van inspiratie: https://socket.io/demos/whiteboard/)
Ik begin allereerst weer met het opstellen van wat variabelen en eventlisteners waarmee tekenen met de muis mogelijk worden gemaakt en waarbij je kleur en dikte kan kiezen.
```JS
var canvas = document.getElementsByClassName('whiteboard')[0];
var colors = document.getElementsByClassName('color');
var strokes = document.getElementsByClassName('stroke');
var context = canvas.getContext('2d');

var current = {
    color: 'black',
    stroke: 2
};
var drawing = false;

canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
}

for (var i = 0; i < strokes.length; i++){
    strokes[i].addEventListener('click', onStrokeUpdate, false);
}
```

Vervolgens wordt hier de logica van het tekenen uitgewerkt, dus waar de lijn moet beginnen en waar die moet eindigen, hoe dik deze lijn moet zijn en welke kleur het moet worden. Deze lijnen worden dan wanneer de muisknop losgelaten is als context geplaatst op de canvas van de website.
```JS
socket.on('drawing', onDrawingEvent);

window.addEventListener('resize', onResize, false);
onResize();

function drawLine(x0, y0, x1, y1, color, stroke, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = stroke;
    context.lineCap = 'round';
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
      stroke: stroke
    });
}
```

Hier zie je alle logica die gebeuren wanneer de event listeners uitgevoerd worden. Bij het indrukken van de muisknop wordt er aangegeven dat er getekend wordt en wordt de X en Y coordinaten meegenomen naar de logica van het tekenen zelf. Bij het bewegen van de muis wordt vervolgens zelf de de teken functie uitgevoerd waarin de huidige coordinaten van de muis gebruikt wordt om aan te geven waar de lijn terecht moet komen. Daarnaast zijn de color en stroke functies er om de juiste kleur en dikte aan de lijn te geven wanneer iemand dit in het menu heeft aangepast.
```JS
function onMouseDown(e){
    drawing = true;
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
}

function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, current.stroke, true);
}

function onMouseMove(e){
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, current.stroke, true);
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
}

function onColorUpdate(e){
    current.color = e.target.className.split(' ')[1];
}

function onStrokeUpdate(e){
    console.log(e.target.className)
    if (e.target.className === "stroke medium") {
        current.stroke = 4;
    } else if (e.target.className === "stroke large") {
        current.stroke = 8;
    } else if (e.target.className === "stroke big") {
        current.stroke = 16;
    } else if (e.target.className === "stroke huge") {
        current.stroke = 32;
    } else {
        current.stroke = 2;
        console.log("test")
    }
 }
```

Hier onder staan nog een paar overgebleven functies zoals de throttle, hiermee wordt er gezorgd dat er een limiet zit op de aantal events die meegestuurd kunnen worden. Een teken event stuurt namelijk bijvoorbeeld enorm veel events mee en dat kan zwaar zijn. Ook wordt bij de overige event gekeken naar de canvas grootte, zodat deze altijd net groot is al het scherm zelf.
```JS
function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
}

function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.stroke);
}

function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
```

#### mouse.js (bron van inspiratie: https://codesandbox.io/s/0wlo27k1v)
Ook hier beginnen we allereerst met een aantal variabelen op te stellen. Met een functie die de huidige tijd ophaalt.
```JS
let prev = {};
let canvas = document.getElementsByClassName("whiteboard")[0];
let pointerContainer = document.getElementById("pointers");
  
let pointer = document.createElement("div");
pointer.setAttribute("class", "pointer");
  
let clients = {};
let pointers = {};
  
function now() {
   return new Date().getTime();
}
  
let lastEmit = now();
```

Hier beginnen we met kijken waar de muis zich momenteel bevind, bij beweging worden de X en Y coordinaten mee genomen. Deze worden vervolgens weer mee gestuurd via sockets.
```JS
canvas.onmouseup = canvas.onmousemove = canvas.onmousedown = function(e) {
  switch (e.type) {
    case "mouseup":
      break;

    case "mousemove":
      socket.emit("mousemove", {
        x: e.pageX,
        y: e.pageY
      });
      lastEmit = now();
      break;

    case "mousedown":
      break;

    default:
      break;
  }
};
```

Hier is de logica wanneer de data meegestuurd word. Vervolgens worden er pointers aangemaakt voor ieder andere gebruiker (jezelf niet) en worden de posities gebaseerd op de gebruikers X en Y coordinaten van de muis. Wanneer een gebruiker weer weggaat, wordt de pointer verwijderd en wordt er niet meer bijgehouden waar die zich bevindt.
```JS
socket.on("moving", function(data) {
  if (!clients.hasOwnProperty(data.id)) {
    pointers[data.id] = pointerContainer.appendChild(pointer.cloneNode());
  }

  pointers[data.id].style.left = data.x + "px";
  pointers[data.id].style.top = data.y + "px";

  clients[data.id] = data;
  clients[data.id].updated = now();
});
  
socket.on("clientdisconnect", function(id) {
  delete clients[id];
  if (pointers[id]) {
    pointers[id].parentNode.removeChild(pointers[id]);
  }
});
```

## Todo
- [x] Kiezen van wat ik wil maken (opdracht)
- [x] Basis chat maken met sockets
- [x] Chat berichten in geschiedenis kunnen opslaan (chatgeschiedenis)
- [x] Canvas kunnen tekenen
- [x] Canvas via sockets bij andere updaten
- [x] Aanpassen van kleur en dikte
- [x] Kleur en dikte via sockets updaten bij andere
- [x] API uitkiezen
- [x] Random gif in de chat kunnen sturen
- [x] Random gif door andere gezien kunnen worden via sockets
- [ ] Canvas opslaan en opnieuw tonen bij pagina binnenkomst
- [ ] Aparte rooms maken met eigen canvas en chat
- [ ] Nicknames toevoegen aan de cursors om te zien wie wie is
- [ ] Mobiele support en responsive maken

## Bronnen
- Chat in socket.io: https://socket.io/get-started/chat
- Whiteboard in socket.io: https://socket.io/demos/whiteboard/
- Cursors in socket.io: https://codesandbox.io/s/0wlo27k1v
- Giphy API: https://developers.giphy.com/ / https://api.giphy.com/v1/gifs/random
