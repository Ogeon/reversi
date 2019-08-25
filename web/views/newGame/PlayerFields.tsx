import * as React from 'react';
import { PlayerType, isValidPlayerType, defaultPlayerValues, playerConfigTemplate, ConfigValue } from '../../playerType';
import { assertUnreachable } from '../../utils';

interface Props {
    idPrefix: string;
    player: PlayerType;
    setPlayer: (type: PlayerType) => void;
}

export function PlayerFields(props: Props) {
    const {idPrefix, player, setPlayer} = props;

    const selectPlayerType = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const playerType = event.target.value;

        if (!isValidPlayerType(playerType)) {
            return;
        }

        if (playerType !== player.type) {
            setPlayer(defaultPlayerValues(playerType));
        }
    };

    const setConfig = (key: string, value: string | number) => {
        setPlayer({
            ...player,
            config: {
                ...player.config,
                [key]: value
            }
        } as PlayerType);
    };

    const configTemplate = playerConfigTemplate(player.type);
    const configFields = Object.keys(configTemplate)
        .map((key) => [key, configTemplate[key]] as const)
        .filter<[string, ConfigValue]>(
            (value): value is [string, ConfigValue] => {
                return !!value[1];
            }
        )
        .map(([key, config]) => {
            const id = `${idPrefix}-config-${key}`;

            switch (config.type) {
                case 'string':
                    return <div key={key}>
                        <label htmlFor={id}>{config.label}</label>
                        <input
                            id={id}
                            value={player.config[key]}
                            onChange={(event) => setConfig(key, event.target.value)}
                        />
                    </div>;
                case 'number':
                    return <div key={key}>
                        <label htmlFor={id}>{config.label}</label>
                        <input
                            type="range"
                            id={id}
                            value={player.config[key]}
                            min={config.min}
                            max={config.max}
                            onChange={(event) => setConfig(key, Number.parseInt(event.target.value, 10))}
                        />
                        {' '}{player.config[key]}
                    </div>;
                default: return assertUnreachable(config);
            }
        })


    return <>
        <div>
            <label htmlFor={`${idPrefix}-player-type`}>Player type</label>
            <select id={`${idPrefix}-player-type`} value={player.type} onChange={selectPlayerType}>
                <option value="human">Human</option>
                <option value="bothello1">AI (Bothello 1.0)</option>
            </select>
        </div>
        {configFields}
    </>;
}
