# chess-moves &middot; [![Node.js CI](https://github.com/JamesTeague/chess-moves/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/JamesTeague/chess-moves/actions/workflows/node.js.yml) [![Node.js Package](https://github.com/JamesTeague/chess-moves/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/JamesTeague/chess-moves/actions/workflows/npm-publish.yml)
Simple library for making moves using [chess.js](https://github.com/jhlywa/chess.js) with the intention of using the state for showing [Chessground](https://github.com/lichess-org/chessground) board.

## Why?
When getting started trying to make my own chess applications, writing the turn logic was always a bit difficult to get started. 
This library is intended to make writing turn logic and making moves easier by providing a smaller interface to work with.
In addition to that it is also geared towards using [Chessground](https://github.com/lichess-org/chessground) as the graphical
representation. These functions return small games states that should make rendering your board easier to manage.

## Installation

Run the following command to install the most recent version of chess.js from NPM:
```bash
npm install chess-moves
```

## Example Code

```js
import { createChessGame } from 'chess-moves';

const chessGame = createChessGame(ne)
```
