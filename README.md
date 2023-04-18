# guessthedrawing
Real time web project

## Basis data flow
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
