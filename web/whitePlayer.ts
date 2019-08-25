import { ArrayElementType, assertUnreachable } from "./utils";

const MODES = ['player1', 'player2', 'random'] as const;

export type WhitePlayerMode = ArrayElementType<typeof MODES>;

export function isValidWhitePlayerMode(value: string): value is WhitePlayerMode {
    return (MODES as ReadonlyArray<string>).includes(value);
}

export function selectWhitePlayer(mode: WhitePlayerMode): 1 | 2 {
    switch (mode) {
        case 'player1': return 1;
        case 'player2': return 2;
        case 'random': return Math.random() > 0.5 ? 1 : 2;
        default: return assertUnreachable(mode);
    }
}
