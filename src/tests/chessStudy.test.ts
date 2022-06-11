import { beforeEach, describe, it, expect } from 'vitest';
import { Chess, type ChessInstance } from 'chess.js';
import { possibleMovesToDests } from '../utils';
import { pgnTest } from './pgn';
import { ChessStudy, createChessStudy } from '../chessStudy';

describe('ChessStudy', () => {
  let chess: ChessInstance;
  let chessStudy: ChessStudy;

  beforeEach(() => {
    chess = new Chess();
    chessStudy = createChessStudy(pgnTest, chess);
  });

  it('gives all valid moves from a starting position', () => {
    const dests = chessStudy.selectChapter(11)!.getDests();

    expect(dests).toEqual(possibleMovesToDests(chess));
  });

  it('only allows moves from the pgn', () => {
    const chapter = chessStudy.selectChapter(11)!
    const firstMoveDelta = chapter.playAiMove();


    expect(['c4', 'd4', 'g3', 'b4', 'Nf3', 'f4', 'b3', 'Nc3'])
      .toContain(chess.history()[0]);

    let delta = chapter.playUserMove('d7', 'd5');

    expect(firstMoveDelta.fen).toEqual(delta.fen);

    // Round about way of getting a valid move
    const hints = chapter.showHints();
    delta = chapter.playUserMove(hints[0].orig, hints[0].dest!)

    expect(delta.fen).not.toEqual(firstMoveDelta.fen);
    expect(delta.fen).toEqual(chess.fen())
  });

  it('shows hints', () => {
    const chapter = chessStudy.selectChapter(0)!

    const hints = chapter.showHints();
    const expectedHints = [{
      orig: 'e2',
      dest: 'e4',
      brush: 'blue'
    }]

    expect(hints).toEqual(expectedHints)
  })
})