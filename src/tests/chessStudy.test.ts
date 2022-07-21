import { describe, it, expect } from 'vitest';
import { Chess, Square } from 'chess.js';
import { possibleMovesToDests } from '../utils';
import { pgnTest, shortPgn } from './pgn';
import { createChessStudy } from '../chessStudy';

describe('ChessStudy', () => {
  it('allows user to select a chapter', () => {
    const chapter = createChessStudy(pgnTest).selectChapter(11);

    expect(chapter).not.toBe(null);
  });

  it('returns null if chapter does not exist', () => {
    const chapter = createChessStudy(pgnTest).selectChapter(12);

    expect(chapter).toBe(null);
  });

  it('allows chapter to be changed', () => {
    const study = createChessStudy(pgnTest);
    let chapter = study.selectChapter(0)!;

    const delta0 = chapter.playAiMove();
    chapter = study.selectChapter(11)!
    const delta1 = chapter.playAiMove();

    expect(delta0.fen).not.toEqual(delta1.fen);
    expect(delta0.lastMove).not.toEqual(delta1.lastMove);
  });

  it('returns all chapters', () => {
    const study = createChessStudy(pgnTest);

    expect(study.getChapters()).toHaveLength(12);
  });

  it('gives all chapters a title and site', () => {
    const study = createChessStudy(pgnTest);

    study.getChapters().forEach((chapter) => {
      expect(chapter.title).not.toBe('');
      expect(chapter.site).not.toBe('');
    });
  })
});

describe('ChessChapter', () => {
  it('gives all valid moves from a starting position', () => {
    const chess = new Chess();
    const dests = createChessStudy(pgnTest).selectChapter(11)!.getDests();

    expect(dests).toEqual(possibleMovesToDests(chess));
  });

  it('only allows moves from the pgn', () => {
    const chapter = createChessStudy(pgnTest).selectChapter(11)!;
    const localChess = new Chess();

    const firstMoveDelta = chapter.playAiMove();
    localChess.move(firstMoveDelta.lastMove.san);

    expect(['c4', 'd4', 'g3', 'b4', 'Nf3', 'f4', 'b3', 'Nc3']).toContain(
      firstMoveDelta.lastMove.san,
    );

    // Invalid Move
    let delta = chapter.playUserMove('d7', 'd5');

    expect(firstMoveDelta.fen).toEqual(delta.fen);

    // Round about way of getting a valid move
    const hints = chapter.showHints();
    delta = chapter.playUserMove(hints[0].orig, hints[0].dest!);
    localChess.move({
      to: hints[0].dest as Square,
      from: hints[0].orig as Square,
    });

    expect(delta.fen).not.toEqual(firstMoveDelta.fen);
    expect(delta.fen).toEqual(localChess.fen());
  });

  it('shows hints', () => {
    const chapter = createChessStudy(pgnTest).selectChapter(0)!;

    const hints = chapter.showHints();
    const expectedHints = [
      {
        orig: 'e2',
        dest: 'e4',
        brush: 'blue',
      },
    ];

    expect(hints).toEqual(expectedHints);
  });

  it('denotes end of line', () => {
    const chapter = createChessStudy(shortPgn).selectChapter(0)!;
    [...Array(10).keys()].forEach(() => chapter.playAiMove());

    expect(chapter.isEndOfLine()).toBe(true);
  });

  it('loads a fen', () => {
    const chessStudy = createChessStudy(shortPgn).selectChapter(0);
    const delta = chessStudy!.load('8/7P/4k3/8/8/3K4/p7/8 b - - 0 1');

    expect(delta).toMatchObject({
      fen: '8/7P/4k3/8/8/3K4/p7/8 b - - 0 1',
      turnColor: 'black',
    });
  });

  it('resets to allow repetition', () => {
    const chapter = createChessStudy(shortPgn).selectChapter(0)!;
    [...Array(10).keys()].forEach(() => chapter.playAiMove());

    expect(chapter.isEndOfLine()).toBe(true);

    chapter.reset();

    expect(chapter.isEndOfLine()).toBe(false);
  });
})
