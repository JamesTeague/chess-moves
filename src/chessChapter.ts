import type { Key } from 'chessground/types';
import { Chess, type ChessInstance, type Square } from 'chess.js';
import type { PgnMove } from '@mliebelt/pgn-parser';
import type { ChessChapter, DrawShape, Promotion } from './types';
import { createDelta, possibleMovesToDests, toColor } from './utils';

type Line = {
  move: string;
  children: Line[];
  comment?: string;
};

const createNode = (move: PgnMove): Line => {
  const cleanMove = move.notation.notation.replace(/[^a-zA-Z\d-+=#]/g, '');

  return {
    move: cleanMove,
    children: [],
    comment: move.commentAfter,
  };
};

const generateNodes = (game: PgnMove[]) => {
  const nodes = [];

  const rootNode = createNode(game[0]);
  let leaf = rootNode;
  nodes.push(rootNode);

  if (game[0].variations.length > 0) {
    game[0].variations.forEach((variation) => {
      generateNodes(variation).forEach((variationNode) => {
        nodes.push(variationNode);
      });
    });
  }

  for (let i = 1; i < game.length; i++) {
    const firstChild = createNode(game[i]);
    const childNodes = [firstChild];

    if (game[i].variations.length > 0) {
      game[i].variations.forEach((variation) => {
        generateNodes(variation).forEach((variationNode) => {
          childNodes.push(variationNode);
        });
      });
    }

    leaf.children = childNodes;

    leaf = firstChild;
  }

  return nodes;
};

const showHints =
  (
    chess: ChessInstance,
    currentMove: number[],
    possibleMovesFn: (currentMove: number[]) => string[],
  ) =>
  () => {
    const drawShapes: DrawShape[] = [];
    const moves = possibleMovesFn(currentMove);

    const chessCopy = new Chess(chess.fen());

    moves.forEach((move) => {
      const maybeMove = chessCopy.move(move);

      if (maybeMove) {
        drawShapes.push({
          orig: maybeMove.from,
          dest: maybeMove.to,
          brush: 'blue',
        });
      }
    });

    return drawShapes;
  };

const getPossibleMoves = (lines: Line[]) => (currentMove: number[]) => {
  if (currentMove.length === 0) {
    return lines.map(({ move }) => move);
  }

  let line = lines[currentMove[0]].children;

  currentMove.slice(1).forEach((index) => {
    if (line.length) {
      line = line[index].children;
    }
  });

  return line.map(({ move }) => move);
};

const playAiMove =
  (
    chess: ChessInstance,
    currentMove: number[],
    possibleMovesFn: (currentMove: number[]) => string[],
  ) =>
  () => {
    const randomIndex = ~~(Math.random() * possibleMovesFn(currentMove).length);
    const move = possibleMovesFn(currentMove)[randomIndex];

    currentMove.push(randomIndex);

    chess.move(move);

    return createDelta(chess);
  };

const playUserMove =
  (
    chess: ChessInstance,
    currentMove: number[],
    possibleMovesFn: (currentMove: number[]) => string[],
  ) =>
  (origin: Key, destination: Key, promotion?: Promotion) => {
    const move = chess.move({
      from: <Square>origin,
      to: <Square>destination,
      promotion,
    });

    if (move && possibleMovesFn(currentMove).includes(move.san)) {
      const indexOfMove = possibleMovesFn(currentMove).findIndex(
        (possibleMove) => possibleMove === move.san,
      );
      currentMove.push(indexOfMove);
    } else {
      chess.undo();
    }

    return createDelta(chess);
  };

const turnColor = (chess: ChessInstance) => () => toColor(chess);
const getDests = (game: ChessInstance) => () => possibleMovesToDests(game);

const load = (chess: ChessInstance) => (fen: string) => {
  chess.load(fen);

  return createDelta(chess);
};

const reset = (chess: ChessInstance, currentMove: number[]) => () => {
  chess.reset();
  currentMove.length = 0;
}

export const createChessChapter = (
  chess: ChessInstance,
  moves: PgnMove[],
): ChessChapter => {
  const currentMove: number[] = [];
  const lines = generateNodes(moves);
  const possibleMovesFn = getPossibleMoves(lines);

  return {
    showHints: showHints(chess, currentMove, possibleMovesFn),
    playUserMove: playUserMove(chess, currentMove, possibleMovesFn),
    playAiMove: playAiMove(chess, currentMove, possibleMovesFn),
    turnColor: turnColor(chess),
    getDests: getDests(chess),
    isPromotion: () => false,
    isEndOfLine: () => possibleMovesFn(currentMove).length === 0,
    load: load(chess),
    reset: reset(chess, currentMove),
  };
};
