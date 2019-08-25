import * as React from 'react';

import * as styles from './PlayerName.scss';

interface Props {
    className?: string;
    white: boolean;
    name: string;
    inline?: boolean;
}

export function PlayerName(props: Props) {
    const {className, white, name, inline} = props;

    const colorClass = white ? styles.white : styles.black;
    const dotClassNames = [styles.colorDot, colorClass];

    const containerClassNames = [styles.container];

    if (inline) {
        containerClassNames.push(styles.inline);
    }

    if (className) {
        containerClassNames.push(className);
    }

    return <div className={containerClassNames.join(' ')}>
        <div className={dotClassNames.join(' ')} /> {name}
    </div>;
}
