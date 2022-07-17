import { Chess, type ChessInstance, type Square } from 'chess.js';
import { createDelta, possibleMovesToDests, toColor } from './utils';
import { ChessGame, GameDelta, Key, Promotion } from './types';

export const createChessGame = (fen?: string): ChessGame => {
  const chess = new Chess(fen);

  return {
    getDests: getDests(chess),
    isPromotion: isPromotion(chess),
    playUserMove: playUserMove(chess),
    playAiMove: playAiMove(chess),
    turnColor: turnColor(chess),
    load: load(chess),
  };
};

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

const load = (chess: ChessInstance) => (fen: string) => {
  chess.load(fen);

  return createDelta(chess);
};
