import { describe, it, expect } from 'vitest';
import { Chess, Square } from 'chess.js';
import { possibleMovesToDests } from '../utils';
import { caroPgn, londonPgn, modernPgn, shortPgn } from './pgn';
import { createChessStudy } from '../chessStudy';

describe('ChessStudy', () => {
  it('allows user to select a chapter', () => {
    const chapter = createChessStudy(modernPgn).selectChapter(11);

    expect(chapter).not.toBe(null);
  });

  it('returns null if chapter does not exist', () => {
    const chapter = createChessStudy(modernPgn).selectChapter(12);

    expect(chapter).toBe(null);
  });

  it('allows chapter to be changed', () => {
    const study = createChessStudy(modernPgn);
    let chapter = study.selectChapter(0)!;

    const delta0 = chapter.playAiMove();
    chapter = study.selectChapter(11)!
    const delta1 = chapter.playAiMove();

    expect(delta0.fen).not.toEqual(delta1.fen);
    expect(delta0.lastMove).not.toEqual(delta1.lastMove);
  });

  it('returns all chapters', () => {
    const study = createChessStudy(modernPgn);

    expect(study.getChapters()).toHaveLength(12);
  });

  it('gives all chapters a title and site', () => {
    const study = createChessStudy(modernPgn);

    study.getChapters().forEach((chapter) => {
      expect(chapter.title).not.toBe('');
      expect(chapter.site).not.toBe('');
    });
  })
});

describe('ChessChapter', () => {
  it('gives all valid moves from a starting position', () => {
    const chess = new Chess();
    const dests = createChessStudy(modernPgn).selectChapter(11)!.getDests();

    expect(dests).toEqual(possibleMovesToDests(chess));
  });

  it('only allows moves from the pgn', () => {
    const chapter = createChessStudy(modernPgn).selectChapter(11)!;
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

  it('shows all hints', () => {
    const chapter = createChessStudy(modernPgn).selectChapter(0)!;

    chapter.playAiMove();
    chapter.playUserMove('g7', 'g6');
    chapter.playAiMove();
    chapter.playUserMove('f8', 'g7');
    chapter.playAiMove();

    const hints = chapter.showHints()

    const expectedHints = [
      {
        orig: 'd7',
        dest: 'd6',
        brush: 'blue',
      },
      {
        orig: 'a7',
        dest: 'a6',
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
    const chapter = createChessStudy(shortPgn).selectChapter(0)!;
    const delta = chapter.load('8/7P/4k3/8/8/3K4/p7/8 b - - 0 1');

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

  it('shows comments after moves', () => {
    const chapter = createChessStudy(shortPgn).selectChapter(0)!;
    const delta = chapter.playAiMove();

    expect(delta.comment).toBe('Can only play against 1. e4')
  });

  it.each([
    {
      pgn: modernPgn,
      firstChapterTitle: 'Modern Defense - Anti-Fianchetto (150 Attack)',
      index: 0
    },
    {
      pgn: londonPgn,
      firstChapterTitle: 'Chapter 1 - London: Black Plays Be7',
      index: 1,
    },
    {
      pgn: caroPgn,
      firstChapterTitle: 'Caro-Kann - Repertoire Overview',
      index: 0,
    }])('finds the correct title for given chapter', ({ pgn, firstChapterTitle, index})=>{
    const chapter = createChessStudy(pgn).selectChapter(index)!;

    expect(chapter.title).toEqual(firstChapterTitle);
  });
})
