export type Key = import('chessground/types').Key
export type Dests = import('chessground/types').Dests

export interface GameDelta {
  fen: string;
  turnColor: 'white' | 'black';
  isCheck: boolean;
  dests: Dests;
  lastMove: import('chess.js').Move;
  isGameOver: boolean;
  isStalemate: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
}

export type Promotion = 'q' | 'b' | 'n' | 'r' | undefined;

export interface ChessGame {
  getDests(): Dests;
  isPromotion(origin: Key, destination: Key): boolean;
  playUserMove(origin: Key, destination: Key, promotion?: Promotion): GameDelta;
  playAiMove(): GameDelta;
  turnColor(): 'white' | 'black';
  load(fen: string): GameDelta;
}

export interface ChessStudy {
  selectChapter(index: number): ChessChapter | null;
  getChapters(): ChessChapter[]
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