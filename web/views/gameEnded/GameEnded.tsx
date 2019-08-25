import * as React from 'react';
import { Modal } from '../../components/modal/Modal';
import { PlayerName } from '../../components/PlayerName';

import * as styles from './GameEnded.scss';

interface Props {
    player1Name: string
    player1Score: number;
    player2Name: string;
    player2Score: number;
    whitePlayer: 1 | 2;
    onPlayAgain: () => void;
    onNewGame: () => void;
}

export function GameEnded(props: Props) {
    const {player1Name, player1Score, player2Name, player2Score, whitePlayer, onPlayAgain, onNewGame} = props;

    let winner: 'tie' | 1 | 2 = 'tie';

    if (player1Score > player2Score) {
        winner = 1;
    } else if (player2Score > player1Score) {
        winner = 2;
    }

    let headline: React.ReactNode = 'It\'s a tie!';
    let content;

    if (winner !== 'tie') {
        const name = winner === 1 ? player1Name : player2Name;
        const [winnerScore, opponentScore] = winner === 1 ? [player1Score, player2Score] : [player2Score, player1Score];

        headline = 'Victory!';
        content = <>
            <p className={styles.score}><PlayerName inline white={whitePlayer === winner} name={name} />!</p>
            <p className={styles.score}>With {winnerScore} vs {opponentScore}</p>
        </>;
    }

    return <Modal open>
        <h1 className={styles.headline}>{headline}</h1>
        {content}
        <div className={styles.buttons}>
            <button type="button" onClick={onPlayAgain}>Play again</button>
            <button type="button" onClick={onNewGame}>New game</button>
        </div>
    </Modal>
}
