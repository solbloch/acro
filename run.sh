#!/bin/sh

# Run the game, log to game.log

node src/backend/app.js >> game.log & 2>&1
