import * as React from 'react';
import { WhitePlayerMode, isValidWhitePlayerMode } from '../../whitePlayer';
import { PlayerType } from '../../playerType';
import { PlayerFields } from './PlayerFields';
import { Modal } from '../../components/modal/Modal';

import * as styles from './NewGame.scss'

interface Props {
    open: boolean;
    player1: PlayerType;
    setPlayer1: (type: PlayerType) => void;

    player2: PlayerType;
    setPlayer2: (type: PlayerType) => void;

    whitePlayer: WhitePlayerMode;
    setWhitePlayer: (mode: WhitePlayerMode) => void;

    startGame: () => void;
}

export function NewGame(props: Props) {
    const {open, player1, setPlayer1, player2, setPlayer2, whitePlayer, setWhitePlayer, startGame} = props;

    const selectWhitePlayer = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;

        if (isValidWhitePlayerMode(value)) {
            setWhitePlayer(value);
        }
    };

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        event.stopPropagation();
        startGame();
    }

    return <Modal open={open}>
        <h1>New game</h1>
        <form className={styles.form} onSubmit={onSubmit}>
            <fieldset>
                <legend>Player 1</legend>
                <PlayerFields
                    idPrefix="player1"
                    player={player1}
                    setPlayer={setPlayer1}
                />
            </fieldset>
            <fieldset>
                <legend>Player 2</legend>
                <PlayerFields
                    idPrefix="player2"
                    player={player2}
                    setPlayer={setPlayer2}
                />
            </fieldset>
            <fieldset>
                <legend>Game Mode</legend>
                <div>
                    <label htmlFor="white-player-mode">White player</label>
                    <select id="white-player-mode" value={whitePlayer} onChange={selectWhitePlayer}>
                        <option value="random">Random</option>
                        <option value="player1">Player 1</option>
                        <option value="player2">Player 2</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="rule-set">Rules</label>
                    <select id="rule-set" value="othello" disabled>
                        <option value="othello">Othello</option>
                    </select>
                </div>
            </fieldset>
            <div>
                <button type="submit">Play!</button>
            </div>
        </form>
    </Modal>;
}
