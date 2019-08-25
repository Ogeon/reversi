import * as React from 'react';
import { selectWhitePlayer, WhitePlayerMode } from '../../whitePlayer';

const OTHELLO_BOARD = [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 2, 0, 0, 0,
    0, 0, 0, 2, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
] as const;

export interface SettingUp {
    type: 'settingUp';
    board: Board;
    startGame: (whitePlayerMode: WhitePlayerMode) => void;
}

export interface Playing {
    type: 'playing';
    whitePlayer: 1 | 2;
    board: Board;
    currentPlayer: 1 | 2;
    turn: number;
    legalMoves: Set<number>;
    makeMove: (index: number) => boolean;
    pass: () => void;
}

export interface Ended {
    type: 'ended';
    whitePlayer: 1 | 2;
    board: Board;
    playAgain: (whitePlayerMode: WhitePlayerMode) => void;
    newGame: () => void;
}

type GameState = SettingUp | Playing | Ended;

interface InternalSettingUp {
    type: 'settingUp';
}

interface InternalPlaying {
    type: 'playing';
    whitePlayer: 1 | 2;
    board: Board;
    turn: number;
    legalMoves: Map<number, Board>;
}

interface InternalEnded {
    type: 'ended'
    whitePlayer: 1 | 2;
    board: Board;
}

type InternalState = InternalSettingUp | InternalPlaying | InternalEnded;

export type Board = ReadonlyArray<BoardCell | undefined>;

interface BoardCell {
    readonly color: 'w' | 'b';
    readonly originalColor: 'w' | 'b';
}

export function useGameState(): GameState {
    const [internalState, setInternalState] = React.useReducer(reducer, {type: 'settingUp'});

    const board = React.useMemo(() => {
        if ('board' in internalState) {
            return internalState.board;
        } else {
            return initializeBoard(OTHELLO_BOARD);
        }
    }, [internalState]);

    const startGame = React.useCallback((whitePlayerMode: WhitePlayerMode) => {
        setInternalState(startGameAction(whitePlayerMode, board));
    }, [board]);

    const makeMove = React.useCallback((index: number) => {
        if (internalState.type !== 'playing') {
            return false;
        }

        const newBoard = internalState.legalMoves.get(index);

        if (newBoard) {
            setInternalState(placePieceAction(newBoard));
            return true;
        } else {
            return false;
        }
    }, [board, internalState]);

    const pass = React.useCallback(() => {
        setInternalState(passAction());
    }, []);

    const playAgain = React.useCallback((whitePlayerMode: WhitePlayerMode) => {
        setInternalState(startGameAction(whitePlayerMode, initializeBoard(OTHELLO_BOARD)));
    }, []);

    const newGame = React.useCallback(() => {
        setInternalState(newGameAction());
    }, []);

    return React.useMemo(() => {
        switch (internalState.type) {
            case 'settingUp':
                return {
                    type: 'settingUp',
                    board,
                    startGame,
                };
            case 'playing':
                return {
                    type: 'playing',
                    whitePlayer: internalState.whitePlayer,
                    board: internalState.board,
                    turn: internalState.turn,
                    currentPlayer: getCurrentPlayer(internalState.turn, internalState.whitePlayer),
                    legalMoves: new Set(internalState.legalMoves.keys()),
                    makeMove,
                    pass,
                };
            case 'ended':
                return {
                    type: 'ended',
                    whitePlayer: internalState.whitePlayer,
                    board: internalState.board,
                    playAgain,
                    newGame,
                }
            default: return internalState;
        }
    }, [internalState]);
}

type Action = StartGameAction | PlacePieceAction | PassAction | NewGameAction;

function reducer(state: InternalState, action: Action): InternalState {
    switch (action.type) {
        case 'startGame':
            if (state.type === 'playing') {
                return state;
            }

            return {
                type: 'playing',
                whitePlayer: selectWhitePlayer(action.payload.whitePlayerMode),
                board: action.payload.board,
                turn: 0,
                legalMoves: getLegalMoves(action.payload.board, 'w'),
            };
        case 'placePiece':
            if (state.type !== 'playing') {
                return state;
            }

            return placePieceReducer(state, action.payload);
        case 'pass':
            if (state.type !== 'playing') {
                return state;
            }

            return passReducer(state);
        case 'newGame':
            if (state.type !== 'ended') {
                return state;
            }

            return {
                type: 'settingUp',
            }
        default: return state;
    }
}

function placePieceReducer(state: InternalPlaying, payload: PlacePieceAction['payload']): InternalPlaying | InternalEnded {
    const turn = state.turn + 1;
    const board = payload.newBoard;
    const color = turn % 2 === 0 ? 'w' : 'b';
    const legalMoves = getLegalMoves(board, color);

    if (legalMoves.size === 0) {
        const opponentLegalMoves = getLegalMoves(board, color === 'w' ? 'b' : 'w');

        if (opponentLegalMoves.size === 0) {
            return {
                type: 'ended',
                whitePlayer: state.whitePlayer,
                board,
            }
        }
    }

    return {
        ...state,
        board,
        turn,
        legalMoves,
    };
}

function passReducer(state: InternalPlaying): InternalPlaying | InternalEnded {
    const turn = state.turn + 1;
    const board = state.board;
    const color = turn % 2 === 0 ? 'w' : 'b';
    const legalMoves = getLegalMoves(board, color);

    if (legalMoves.size === 0) {
        const opponentLegalMoves = getLegalMoves(board, color === 'w' ? 'b' : 'w');

        if (opponentLegalMoves.size === 0) {
            return {
                type: 'ended',
                whitePlayer: state.whitePlayer,
                board,
            }
        }
    }

    return {
        ...state,
        turn,
        legalMoves,
    };
}

interface StartGameAction {
    type: 'startGame',
    payload: {
        whitePlayerMode: WhitePlayerMode;
        board: Board;
    };
}

function startGameAction(whitePlayerMode: WhitePlayerMode, board: Board): StartGameAction {
    return {
        type: 'startGame',
        payload: {
            whitePlayerMode,
            board,
        },
    };
}

interface PlacePieceAction {
    type: 'placePiece';
    payload: {
        newBoard: Board;
    };
}

function placePieceAction(newBoard: Board): PlacePieceAction {
    return {
        type: 'placePiece',
        payload: {
            newBoard
        }
    };
}

interface PassAction {
    type: 'pass';
    payload: void;
}

function passAction(): PassAction {
    return {
        type: 'pass',
        payload: undefined
    };
}

interface NewGameAction {
    type: 'newGame';
    payload: void;
}

function newGameAction(): NewGameAction {
    return {
        type: 'newGame',
        payload: undefined
    };
}

function initializeBoard(prototype: ReadonlyArray<0 | 1 | 2>): Board {
    return prototype.map((cell) => {
        if (cell === 0) {
            return;
        }

        const color = cell === 1 ? 'w' : 'b';
        return {
            color,
            originalColor: color
        };
    });
}

function tryToPlacePiece(board: Board, index: number, color: 'w' | 'b'): Board | undefined {
    const newBoard = [...board];

    if (newBoard[index]) {
        return;
    }

    newBoard[index] = {color, originalColor: color};

    const y = Math.floor(index / 8);
    const x = index - (y * 8);

    let flipped: number[] = [];

    if (x < 7) {
        flipped = flipped.concat(flipPiecesRight(newBoard, index, 1, 7 - x, color));

        if (y < 7) {
            flipped = flipped.concat(flipPiecesRight(newBoard, index, 9, Math.min(7 - x, 7 - y), color));
        }

        if (y > 0) {
            flipped = flipped.concat(flipPiecesLeft(newBoard, index, 7, Math.min(7 - x, y), color));
        }
    }

    if (x > 0) {
        flipped = flipped.concat(flipPiecesLeft(newBoard, index, 1, x, color));

        if (y > 0) {
            flipped = flipped.concat(flipPiecesLeft(newBoard, index, 9, Math.min(x, y), color));
        }

        if (y < 7) {
            flipped = flipped.concat(flipPiecesRight(newBoard, index, 7, Math.min(x, 7 - y), color));
        }
    }

    if (y < 7) {
        flipped = flipped.concat(flipPiecesRight(newBoard, index, 8, 7 - y, color));
    }

    if (y > 0) {
        flipped = flipped.concat(flipPiecesLeft(newBoard, index, 8, y, color));
    }

    if (flipped.length) {
        for (const index of flipped) {
            const cell = newBoard[index];

            if (!cell) {
                console.log('unexpected empty cell on index', index);
                return;
            }

            newBoard[index] = {...cell, color: cell.color === 'w' ? 'b' : 'w'}
        }

        return newBoard;
    }
}

function flipPiecesLeft(board: Board, index: number, shift: number, steps: number, color: 'w' | 'b'): number[] {
    const flipped = [];

    for (let i = 0; i < steps; i++) {
        index -= shift;
        const cell = board[index]

        if (cell && cell.color !== color) {
            // Mark their piece for flipping
            flipped.push(index);
        } else if (cell && cell.color === color) {
            // Reached one of our pieces, so return the marked opponent pieces
            return flipped;
        } else {
            // Didn't reach any of our pieces, so do nothing
            return [];
        }
    }

    // Reached the edge of the board, so do nothing
    return [];
}

function flipPiecesRight(board: Board, index: number, shift: number, steps: number, color: 'w' | 'b'): number[] {
    const flipped = [];

    for (let i = 0; i < steps; i++) {
        index += shift;
        const cell = board[index]

        if (cell && cell.color !== color) {
            // Mark their piece for flipping
            flipped.push(index);
        } else if (cell && cell.color === color) {
            // Reached one of our pieces, so return the marked opponent pieces
            return flipped;
        } else {
            // Didn't reach any of our pieces, so do nothing
            return [];
        }
    }

    // Reached the edge of the board, so do nothing
    return [];
}

function getLegalMoves(board: Board, color: 'w' | 'b') {
    const legalMoves = new Map<number, Board>();

    board.forEach((cell, index) => {
        const result = !cell && tryToPlacePiece(board, index, color);
        if (result) {
            legalMoves.set(index, result);
        }
    })

    return legalMoves;
}

function getCurrentPlayer(turn: number, whitePlayer: 1 | 2): 1 | 2 {
    if (turn % 2 === 0) {
        return whitePlayer;
    }

    return whitePlayer === 1 ? 2 : 1;;
}
