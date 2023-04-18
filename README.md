# Guess The First
Raad als eerste het woord en win de ronde!

## Basis data flow
```
                                ┌────────────┐
                                │            │
                                │ Custom API │
                                │            │
                                └─────┬──────┘
                                      │
                                      │
                                      │
                                      │  GET three random words
                                      │
                                      │
                                      │
┌────────────┐ Connect          ┌─────▼──────┐
│            │ ───────────────► │            │
│            │                  │            │
│            │ User join        │            │
│            │ ◄─────────────── │            │
│            │                  │            │
│            │ Disconnect       │            │
│            │ ───────────────► │            │
│            │                  │            │
│            │ User leave       │            │
│            │ ◄─────────────── │            │
│   Client   │                  │   Server   │
│            │ Drawing          │            │
│            │ ───────────────► │            │
│            │                  │            │
│            │ Update canvas    │            │
│            │ ◄─────────────── │            │
│            │                  │            │
│            │ Sends message    │            │
│            │ ───────────────► │            │
│            │                  │            │
│            │ Update chat      │            │
└────────────┘ ◄─────────────── └────────────┘
```

## Bronnen
- Background: https://www.wallpaperflare.com/black-and-white-character-print-poster-doodle-artwork-sketches-wallpaper-mgc
