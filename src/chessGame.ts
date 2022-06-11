import type { Dests, Key } from 'chessground/types';
import type { ChessInstance, Square } from 'chess.js';
import { createDelta, possibleMovesToDests, toColor } from './utils';

export type GameDelta = {
  fen: string;
  turnColor: 'white' | 'black';
  isCheck: boolean;
  dests: Dests;
};

export type Promotion = 'q' | 'b' | 'n' | 'r' | undefined;

export interface ChessGame {
  getDests(): Dests;
  isPromotion(origin: Key, destination: Key): boolean;
  playUserMove(origin: Key, destination: Key, promotion?: Promotion): GameDelta;
  playAiMove(): GameDelta;
  turnColor(): 'white' | 'black';
}

export const createChessGame = (chess: ChessInstance): ChessGame => ({
  getDests: getDests(chess),
  isPromotion: isPromotion(chess),
  playUserMove: playUserMove(chess),
  playAiMove: playAiMove(chess),
  turnColor: turnColor(chess),
});

const getDests = (game: ChessInstance) => () => possibleMovesToDests(game);

const possiblePromotions = (chess: ChessInstance) => () =>
  chess.moves({ verbose: true }).filter(({ promotion }) => !!promotion);

const isPromotion =
  (chess: ChessInstance) =>
  (origin: Key, destination: Key): boolean => {
    const promotion = possiblePromotions(chess)().find(
      ({ to, from }) => from == origin && to == destination,
    );

    return !!promotion;
  };

const turnColor = (chess: ChessInstance) => () => toColor(chess);

const playUserMove =
  (chess: ChessInstance) =>
  (origin: Key, destination: Key, promotion?: Promotion): GameDelta => {
    chess.move({ from: <Square>origin, to: <Square>destination, promotion });

    return createDelta(chess);
  };

const playAiMove = (chess: ChessInstance) => () => {
  const moves = chess.moves({ verbose: true });

  const move = moves[~~Math.random() * moves.length];

  chess.move(move);

  return createDelta(chess);
};
