import { type ChessInstance, SQUARES } from 'chess.js';
import type { Dests } from 'chessground/types';
import type { GameDelta } from './chessGame';

export const possibleMovesToDests = (game: ChessInstance): Dests => {
  const dests: Dests = new Map();

  SQUARES.forEach((square) => {
    const moves = game.moves({ square, verbose: true });
    if (moves.length) {
      dests.set(
        square,
        moves.map((move) => move.to),
      );
    }
  });

  return dests;
};

export const toColor = (game: ChessInstance) =>
  game.turn() === 'w' ? 'white' : 'black';

export const createDelta = (chess: ChessInstance): GameDelta => {
  const history = chess.history({ verbose: true });

  return {
    fen: chess.fen(),
    turnColor: toColor(chess),
    isCheck: chess.in_check(),
    dests: possibleMovesToDests(chess),
    lastMove: history[history.length - 1],
    isInsufficientMaterial: chess.insufficient_material(),
    isCheckmate: chess.in_checkmate(),
    isDraw: chess.in_draw(),
    isGameOver: chess.game_over(),
    isStalemate: chess.in_stalemate(),
    isThreefoldRepetition: chess.in_threefold_repetition(),
  }
};
