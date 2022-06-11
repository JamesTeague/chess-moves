import { beforeAll, describe, it, expect } from 'vitest';
import { Chess, type ChessInstance } from 'chess.js';
import { createChessGame, type ChessGame, Promotion } from '../chessGame';
import { possibleMovesToDests } from '../utils';

describe('ChessGame', () => {
  let chess: ChessInstance;
  let chessGame: ChessGame;

  beforeAll(() => {
    chess = new Chess();
    chessGame = createChessGame(chess);
  });

  it('gives all valid moves from a starting position', () => {
    const chess = new Chess();
    const chessGame = createChessGame(chess);

    const dests = chessGame.getDests();

    expect(dests).toEqual(possibleMovesToDests(chess));
  });

  it('plays moves and returns GameDelta', () => {
    const chess = new Chess();
    const chessGame = createChessGame(chess);

    const delta = chessGame.playUserMove('d2', 'd4');

    expect(delta).toEqual({
      fen: chess.fen(),
      turnColor: 'black',
      isCheck: false,
      dests: possibleMovesToDests(chess),
    });
  });

  it('plays opponent moves and returns GameDelta', () => {
    const chess = new Chess();
    const chessGame = createChessGame(chess);

    const delta = chessGame.playAiMove();

    expect(delta).toEqual({
      fen: chess.fen(),
      turnColor: 'black',
      isCheck: false,
      dests: possibleMovesToDests(chess),
    });
  });

  it('plays consecutive and returns GameDelta', () => {
    chessGame.playUserMove('d2', 'd4');
    chessGame.playAiMove();
    chessGame.playUserMove('c1', 'c4');
    const delta = chessGame.playAiMove();

    expect(delta).toEqual({
      fen: chess.fen(),
      turnColor: 'black',
      isCheck: false,
      dests: possibleMovesToDests(chess),
    });
  });

  it('does not play invalid move', () => {
    const chess = new Chess();
    const chessGame = createChessGame(chess);
    const chessCopy = new Chess();

    const delta = chessGame.playUserMove('c1', 'c4');

    expect(delta).toEqual({
      fen: chessCopy.fen(),
      turnColor: 'white',
      isCheck: false,
      dests: possibleMovesToDests(chess),
    });
  });

  it('recognizes promotion', () => {
    const promotionPosition = '8/7P/4k3/8/8/3K4/p7/8 w - - 0 1';
    const chess = new Chess(promotionPosition);
    const chessGame = createChessGame(chess);

    expect(chessGame.isPromotion('h7', 'h8')).toBe(true)
  });

  it.each([
    {
      promotionFen: '7Q/8/4k3/8/8/3K4/p7/8 b - - 0 1',
      piece: 'q' as Promotion,
      name: 'Queen'
    },
    {
      promotionFen: '7R/8/4k3/8/8/3K4/p7/8 b - - 0 1',
      piece: 'r' as Promotion,
      name: 'Rook'
    },
    {
      promotionFen: '7B/8/4k3/8/8/3K4/p7/8 b - - 0 1',
      piece: 'b' as Promotion,
      name: 'Bishop'
    },
    {
      promotionFen: '7N/8/4k3/8/8/3K4/p7/8 b - - 0 1',
      piece: 'n' as Promotion,
      name: 'Knight'
    },
  ])
  ('allows promotion to %s, name',({ promotionFen, piece }) => {
    const promotionPosition = '8/7P/4k3/8/8/3K4/p7/8 w - - 0 1';
    const chess = new Chess(promotionPosition);
    const chessGame = createChessGame(chess);

    const delta = chessGame.playUserMove('h7', 'h8', piece);

    expect(delta.fen).toBe(promotionFen)
  });
});
