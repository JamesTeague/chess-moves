import { describe, it, expect } from 'vitest';
import { Chess, Square } from 'chess.js';
import { possibleMovesToDests } from '../utils';
import { pgnTest } from './pgn';
import { createChessStudy } from '../chessStudy';

describe('ChessStudy', () => {

  it('gives all valid moves from a starting position', () => {
    const chess = new Chess();
    const dests = createChessStudy(pgnTest).selectChapter(11)!.getDests();

    expect(dests).toEqual(possibleMovesToDests(chess));
  });

  it('only allows moves from the pgn', () => {
    const chapter = createChessStudy(pgnTest).selectChapter(11)!
    const localChess = new Chess()

    const firstMoveDelta = chapter.playAiMove();
    localChess.move(firstMoveDelta.lastMove.san)


    expect(['c4', 'd4', 'g3', 'b4', 'Nf3', 'f4', 'b3', 'Nc3'])
      .toContain(firstMoveDelta.lastMove.san);

    // Invalid Move
    let delta = chapter.playUserMove('d7', 'd5');

    expect(firstMoveDelta.fen).toEqual(delta.fen);

    // Round about way of getting a valid move
    const hints = chapter.showHints();
    delta = chapter.playUserMove(hints[0].orig, hints[0].dest!)
    localChess.move({ to: hints[0].dest as Square, from: hints[0].orig as Square})

    expect(delta.fen).not.toEqual(firstMoveDelta.fen);
    expect(delta.fen).toEqual(localChess.fen())
  });

  it('shows hints', () => {
    const chapter = createChessStudy(pgnTest).selectChapter(0)!

    const hints = chapter.showHints();
    const expectedHints = [{
      orig: 'e2',
      dest: 'e4',
      brush: 'blue'
    }]

    expect(hints).toEqual(expectedHints)
  })
})