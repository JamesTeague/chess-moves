import { Chess } from 'chess.js';
import { parse, ParseTree } from '@mliebelt/pgn-parser';
import { createChessChapter } from './chessChapter';
import { ChessChapter, ChessStudy } from './types';

export const createChessStudy = (pgn: string): ChessStudy => {
  const chess = new Chess();
  const chapters = new Map<number, ChessChapter>();
  const parsedPgn = <ParseTree[]>parse(pgn, { startRule: 'games' });

  parsedPgn.forEach(({ moves }, index) => {
    chapters.set(index, createChessChapter(chess, moves));
  });

  return {
    selectChapter: (index) => chapters?.get(index) ?? null,
  };
};
