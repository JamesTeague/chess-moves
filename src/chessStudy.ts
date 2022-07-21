import { Chess } from 'chess.js';
import { parse, ParseTree } from '@mliebelt/pgn-parser';
import { createChessChapter } from './chessChapter';
import { ChessChapter, ChessStudy } from './types';

export const createChessStudy = (pgn: string): ChessStudy => {
  const chess = new Chess();
  const chapters = new Map<number, ChessChapter>();
  const parsedPgn = <ParseTree[]>parse(pgn, { startRule: 'games' });

  parsedPgn.forEach(({ tags, moves }, index) => {
    chapters.set(index, createChessChapter(chess, moves, tags));
  });

  return {
    selectChapter: (index) => chapters?.get(index) ?? null,
    getChapters: () => Array.from(chapters.values())
  };
};
