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

## Bronnen
- Background: https://www.wallpaperflare.com/black-and-white-character-print-poster-doodle-artwork-sketches-wallpaper-mgc
