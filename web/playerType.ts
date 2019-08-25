import { assertUnreachable } from "./utils";

const PLAYER_TYPES: ReadonlyArray<PlayerType['type']> = ['human', 'bothello1'];

interface HumanPlayer {
    type: 'human';
    config: PlayerConfig & {
        name: string;
    };
}

const HUMAN_CONFIG =  {
    name: string('Name', 'The player\'s name.', ''),
} as const;

interface Bothello1 {
    type: 'bothello1',
    config: PlayerConfig;
}

const BOTHELLO1_CONFIG = {
    depth: number('Planning skill', 'How well the AI plans its moves.', 3, 1, 10)
}

export type PlayerType = HumanPlayer | Bothello1;
export type PlayerConfig = {
    [K: string]: string | number | undefined;
}

export function isValidPlayerType(type: string): type is PlayerType['type'] {
    return (PLAYER_TYPES as ReadonlyArray<string>).includes(type);
}

export function defaultPlayerValues(type: PlayerType['type']): PlayerType {
    const config = playerConfigTemplate(type);

    return {
        type,
        config: Object.keys(config)
            .map((key) => [key, config[key]] as const)
            .filter<[string, ConfigValue]>(
                (value): value is [string, ConfigValue] => {
                    return !!value[1];
                }
            )
            .reduce((result, [key, value]) => {
                return {
                    ...result,
                    [key]: value.defaultValue
                }
            }, {}),
    } as PlayerType;
}

export function playerConfigTemplate(type: PlayerType['type']): {[K: string]: ConfigValue | undefined} {
    switch(type) {
        case 'human': return HUMAN_CONFIG;
        case 'bothello1': return BOTHELLO1_CONFIG;
        default: return assertUnreachable(type);
    }
}

export function playerName(player: PlayerType): string {
    switch(player.type) {
        case 'human': return player.config.name;
        case 'bothello1': return 'Bothello 1.0';
        default: return assertUnreachable(player);
    }
}

interface StringValue {
    type: 'string';
    label: string;
    description: string;
    defaultValue: string;
}

interface NumberValue {
    type: 'number';
    label: string;
    description: string;
    defaultValue: number;
    min: number;
    max: number;
}

export type ConfigValue = StringValue | NumberValue;

function string(label: string, description: string, defaultValue: string): StringValue {
    return {
        type: 'string',
        label,
        description,
        defaultValue
    };
}

function number(label: string, description: string, defaultValue: number, min: number, max: number): NumberValue {
    return {
        type: 'number',
        label,
        description,
        defaultValue,
        min,
        max
    };
}

