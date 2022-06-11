import { beforeAll, describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { createChessGame, type ChessGame, Promotion } from '../chessGame';
import { possibleMovesToDests } from '../utils';

describe('ChessGame', () => {
  let chessGame: ChessGame;

  beforeAll(() => {
    chessGame = createChessGame();
  });

  it('gives all valid moves from a starting position', () => {
    const chess = new Chess();
    const chessGame = createChessGame();

    const dests = chessGame.getDests();

    expect(dests).toEqual(possibleMovesToDests(chess));
  });

  it('plays move and returns GameDelta', () => {
    const chess = new Chess();
    const chessGame = createChessGame();

    const delta = chessGame.playUserMove('d2', 'd4');
    const lastMove = chess.move({ from: 'd2', to: 'd4'})

    expect(delta).toMatchObject({
      fen: chess.fen(),
      turnColor: 'black',
      isCheck: false,
      dests: possibleMovesToDests(chess),
      lastMove
    });
  });

  it('plays opponent moves and returns GameDelta', () => {
    const chess = new Chess();
    const chessGame = createChessGame();

    const delta = chessGame.playAiMove();
    chess.move(delta.lastMove.san)

    expect(delta).toMatchObject({
      fen: chess.fen(),
      turnColor: 'black',
      isCheck: false,
      dests: possibleMovesToDests(chess),
    });
  });

  it('plays consecutive and returns GameDelta', () => {
    const chess = new Chess();
    chessGame.playUserMove('d2', 'd4');
    chess.move({ from: 'd2', to: 'd4' });

    const { lastMove } = chessGame.playAiMove();
    chess.move(lastMove);

    chessGame.playUserMove('c1', 'c4');
    chess.move({ from: 'c1', to: 'c4'})

    const delta = chessGame.playAiMove();
    chess.move(delta.lastMove)

    expect(delta).toMatchObject({
      fen: chess.fen(),
      turnColor: 'black',
      isCheck: false,
      dests: possibleMovesToDests(chess),
    });
  });

  it('does not play invalid move', () => {
    const chess = new Chess();
    const chessGame = createChessGame();

    const delta = chessGame.playUserMove('c1', 'c4');

    expect(delta).toMatchObject({
      fen: chess.fen(),
      turnColor: 'white',
      isCheck: false,
      dests: possibleMovesToDests(chess),
    });
  });

  it('recognizes promotion', () => {
    const chessGame = createChessGame('8/7P/4k3/8/8/3K4/p7/8 w - - 0 1');

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
    const chessGame = createChessGame('8/7P/4k3/8/8/3K4/p7/8 w - - 0 1');

    const delta = chessGame.playUserMove('h7', 'h8', piece);

    expect(delta.fen).toBe(promotionFen)
  });
});
