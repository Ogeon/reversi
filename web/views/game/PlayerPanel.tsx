import * as React from 'react';

import * as styles from './PlayerPanel.scss';
import { PlayerName } from '../../components/PlayerName';

interface Props {
    className?: string;
    name: string;
    isWhite: boolean;
    score: number;
    playersTurn: boolean;
    onPass: (() => void) | undefined;
}

export function PlayerPanel(props: Props) {
    const {className, name, isWhite, score, playersTurn, onPass} = props;

    const classNames = [styles.playerPanel];

    if (className) {
        classNames.push(className);
    }

    if (playersTurn) {
        classNames.push(styles.yourTurn);
    }

    const passButton = <button
        disabled={!playersTurn}
        onClick={onPass}
    >
        Pass
    </button>;

    return <div className={classNames.join(' ')}>
        <PlayerName className={styles.name} white={isWhite} name={name} />
        <div className={styles.score}>{score < 10 ? `0${score}` : score}</div>
        <div className={styles.controls}>{onPass && passButton}</div>
    </div>;
}
