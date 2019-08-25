import { PlayerConfig } from "./playerType";

export type Message = GetMove | NewMove;

interface GetMove {
    type: 'get move';
    turn: number;
    board: number[];
    config: PlayerConfig;
}

interface NewMove {
    type: 'new move';
    turn: number;
    index: number | undefined;
}
