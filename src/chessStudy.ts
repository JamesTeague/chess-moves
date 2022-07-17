import { Chess } from 'chess.js';
import { parse, ParseTree } from '@mliebelt/pgn-parser';
import { createChessChapter } from './chessChapter';
import { ChessGame, GameDelta, Promotion } from './chessGame';

export interface ChessStudy {
  selectChapter(index: number): ChessChapter | null;
}

export interface ChessChapter extends ChessGame {
  showHints(): DrawShape[];
  playUserMove(origin: string, destination: string, promotion?: Promotion): GameDelta;
  playAiMove(): GameDelta;
  isEndOfLine(): boolean;
  reset(): void;
}

export interface DrawShape {
  orig: string;
  dest?: string;
  brush?: string;
  modifiers?: { lineWidth?: number };
  piece?: {
    role: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
    color: 'white' | 'black';
    scale?: number;
  };
  customSvg?: string;
}

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
