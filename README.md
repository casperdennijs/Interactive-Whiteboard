# Interactive Whiteboard (Real time web)
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

## Bronnen
- Background: https://www.wallpaperflare.com/black-and-white-character-print-poster-doodle-artwork-sketches-wallpaper-mgc
