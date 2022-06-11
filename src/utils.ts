import { type ChessInstance, SQUARES } from 'chess.js';
import type { Dests, Key } from 'chessground/types';
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

export const possiblePromotions = (game: ChessInstance) =>
  game.moves({ verbose: true }).filter(({ promotion }) => !!promotion);

export const isPromotion = (
  game: ChessInstance,
  origin: Key,
  destination: Key,
): boolean => {
  const promotion = possiblePromotions(game).find(
    ({ to, from }) => from == origin && to == destination,
  );

  return !!promotion;
};

export const toColor = (game: ChessInstance) =>
  game.turn() === 'w' ? 'white' : 'black';

export const createDelta = (chess: ChessInstance): GameDelta => ({
  fen: chess.fen(),
  turnColor: toColor(chess),
  isCheck: chess.in_check(),
  dests: possibleMovesToDests(chess),
});
