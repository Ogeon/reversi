import * as React from 'react';
import { PlayerType, PlayerConfig, playerName } from '../../playerType';
import { WhitePlayerMode } from '../../whitePlayer';
import { Message } from '../../Message';
import { PlayerPanel } from './PlayerPanel';
import { useAreModalsOpen } from '../../components/modal/ModalContext';
import { useGameState, Board, Playing } from './useGameState';
import { NewGame } from '../newGame/NewGame';

import * as styles from './Game.scss';
import { GameEnded } from '../gameEnded/GameEnded';

const bothello1Worker = new Worker('/bothello1.worker.js');

export function Game() {
    const [player1, setPlayer1] = React.useState<PlayerType>({type: 'human', config: {name: 'Player 1'}});
    const [player2, setPlayer2] = React.useState<PlayerType>({type: 'human', config: {name: 'Player 2'}});
    const [whitePlayerMode, setWhitePlayerMode] = React.useState<WhitePlayerMode>('random');

    const modalsOpen = useAreModalsOpen();
    const gameState = useGameState();

    const startGame = () => {
        if (gameState.type === 'settingUp') {
            gameState.startGame(whitePlayerMode);
        } else if (gameState.type === 'ended') {
            gameState.playAgain(whitePlayerMode);
        }
    }

    const placePiece = (index: number) => {
        if (gameState.type === 'playing') {
            const allowed = gameState.makeMove(index);

            if (!allowed) {
                console.log('the current player is trying to cheat');
            }
        }
    }

    const pass = () => {
        if (gameState.type === 'playing') {
            gameState.pass();
        }
    }

    const onMessage = (message: Message) => {
        if (gameState.type !== 'playing') {
            return;
        }

        const {currentPlayer, turn} = gameState;

        switch (message.type) {
            case 'new move':
                if (message.turn === turn) {
                    if (message.index === undefined) {
                        console.log(`The player ${currentPlayer} AI is passing`);
                        pass();
                    } else {
                        console.log(`The player ${currentPlayer} AI is placing on ${message.index}`);
                        placePiece(message.index);
                    }
                }
            break;
            default: break;
        }
    };

    const onMessageRef = React.useRef(onMessage);
    onMessageRef.current = onMessage;

    React.useEffect(() => {
        if (gameState.type !== 'playing') {
            return;
        }

        requestAiMove(gameState, player1, player2, onMessageRef);
    }, [gameState]);

    let currentPlayerConfig: PlayerType | undefined;
    let legalMoves: Set<number> | undefined;
    let currentPlayer: 1 | 2 | undefined;
    if (gameState.type === 'playing') {
        currentPlayerConfig = gameState.currentPlayer == 1 ? player1 : player2;
        legalMoves = gameState.legalMoves;
        currentPlayer = gameState.currentPlayer;
    }

    const enableClick = currentPlayerConfig && currentPlayerConfig.type === 'human';
    const cells = gameState.board.map((cellState, index) => {
        const classNames = [];

        if (cellState) {
            classNames.push(cellState.color === 'w'? styles.white : styles.black);
            classNames.push(cellState.originalColor === 'w'? styles.originallyWhite : styles.originallyBlack);
        }

        if (legalMoves && legalMoves.has(index)) {
            classNames.push(styles.hint);
        }

        const onClick = enableClick ? () => placePiece(index) : undefined;
        return <div key={index} className={classNames.join(' ')} onClick={onClick} />
    });

    let whitePlayer: 1 | 2 | undefined;
    switch (gameState.type) {
        case 'settingUp':
            switch (whitePlayerMode) {
                case 'player1':
                    whitePlayer = 1;
                    break;
                case 'player2':
                    whitePlayer = 2;
                default:
                    break;
            }
            break;
        default:
            whitePlayer = gameState.whitePlayer;
            break;
    }
    const score = countPieces(gameState.board);
    const player1Score = whitePlayer === 1 ? score.white : score.black;
    const player2Score = whitePlayer === 2 ? score.white : score.black;

    const classNames = [styles.game];

    if (modalsOpen) {
        classNames.push(styles.blurred);
    }

    let gameEnded;
    if (gameState.type === 'ended') {
        gameEnded = <GameEnded
            player1Name={playerName(player1)}
            player1Score={player1Score}
            player2Name={playerName(player2)}
            player2Score={player2Score}
            whitePlayer={gameState.whitePlayer}
            onNewGame={gameState.newGame}
            onPlayAgain={startGame}
        />
    }

    return <>
        <div className={classNames.join(' ')}>
            <div>
                <PlayerPanel
                    className={styles.player1}
                    name={playerName(player1)}
                    isWhite={whitePlayer === 1}
                    onPass={player1.type === 'human' ? pass : undefined}
                    playersTurn={currentPlayer === 1}
                    score={player1Score}
                />
                <PlayerPanel
                    className={styles.player2}
                    name={playerName(player2)}
                    isWhite={whitePlayer === 2}
                    onPass={player2.type === 'human' ? pass : undefined}
                    playersTurn={currentPlayer === 2}
                    score={player2Score}
                />
                <div className={styles.board}>
                    {cells}
                </div>
            </div>
        </div>
        <NewGame
            open={gameState.type === 'settingUp'}
            player1={player1}
            setPlayer1={setPlayer1}
            player2={player2}
            setPlayer2={setPlayer2}
            whitePlayer={whitePlayerMode}
            setWhitePlayer={setWhitePlayerMode}
            startGame={startGame}
        />
        {gameEnded}
    </>;
}

function translateBoard(board: Board, color: 'w' | 'b'): number[] {
    return board.map((space) => {
        switch (space && space.color == color) {
            case true: return 1;
            case false: return 2;
            default: return 0;
        }
    })
}

function moveRequestMessage(board: number[], turn: number, config: PlayerConfig): Message {
    return {
        type: 'get move',
        turn,
        board,
        config
    }
}

function countPieces(board: Board) {
    return board.reduce((score, cell) => {
        switch (cell && cell.color) {
            case 'w':
                score.white += 1;
                break;
            case 'b':
                score.black += 1;
                break;
            default: break;
        }

        return score;
    }, {white: 0, black: 0});
}

function requestAiMove(gameState: Playing, player1: PlayerType, player2: PlayerType, onMessageRef: React.MutableRefObject<(message: Message) => void>) {
    let worker: Worker | undefined;
    const {currentPlayer, board, turn, whitePlayer} = gameState;
    const currentPlayerConfig = currentPlayer == 1 ? player1 : player2;
    const color = whitePlayer === currentPlayer ? 'w' : 'b';

    switch (currentPlayerConfig.type) {
        case 'bothello1':
            worker = bothello1Worker;
            break;
        default: break;
    }

    if (worker) {
        const delayPromise = new Promise((resolve) => setTimeout(() => resolve(), 350));
        const messagePromise = new Promise<MessageEvent>((resolve) => {
            const listener = (event: MessageEvent) => {
                worker!.removeEventListener('message', listener);
                resolve(event);
            }

            worker!.addEventListener('message', listener);
        });
        Promise.all([messagePromise, delayPromise])
            .then(([event]) => onMessageRef.current(event.data));

        worker.postMessage(moveRequestMessage(translateBoard(board, color), turn, currentPlayerConfig.config));
    }
}
