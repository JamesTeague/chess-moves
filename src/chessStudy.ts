import type { ChessGame, GameDelta, Promotion } from './chessGame';
import type { DrawShape } from 'chessground/draw';
import type { Key } from 'chessground/types';
import { Chess, type ChessInstance, type Square } from 'chess.js';
import { parse, type PgnMove } from '@mliebelt/pgn-parser';
import { createDelta, possibleMovesToDests, toColor } from './utils';

interface ChessStudy extends ChessGame {
  showHints(): DrawShape[];
  playUserMove(origin: Key, destination: Key, promotion?: Promotion): GameDelta;
  playAiMove(): GameDelta;
}

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
  (chess: ChessInstance, lines: Line[], currentMove: number[]) => () => {
    const drawShapes: DrawShape[] = [];
    const moves = getPossibleMoves(lines)(currentMove);

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
  (chess: ChessInstance, lines: Line[], currentMove: number[]) => () => {
    const randomIndex = ~~(
      Math.random() * getPossibleMoves(lines)(currentMove).length
    );
    const move = getPossibleMoves(lines)(currentMove)[randomIndex];

    currentMove.push(randomIndex);

    chess.move(move);

    return createDelta(chess);
  };

const playUserMove =
  (chess: ChessInstance, lines: Line[], currentMove: number[]) =>
  (origin: Key, destination: Key, promotion?: Promotion) => {
    const move = chess.move({
      from: <Square>origin,
      to: <Square>destination,
      promotion,
    });

    if (move && getPossibleMoves(lines)(currentMove).includes(move.san)) {
      const indexOfMove = getPossibleMoves(lines)(currentMove).findIndex(
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

export const createChessStudy = (
  pgn: string,
  chess: ChessInstance,
): ChessStudy => {
  const currentMove: number[] = [];
  const parsedPgn = <PgnMove[]>parse(pgn, { startRule: 'games' });
  const lines = generateNodes(parsedPgn);

  return {
    showHints: showHints(chess, lines, currentMove),
    playUserMove: playUserMove(chess, lines, currentMove),
    playAiMove: playAiMove(chess, lines, currentMove),
    turnColor: turnColor(chess),
    getDests: getDests(chess),
    isPromotion: () => false,
  };
};
