import { Message } from './Message';

const ai = import('../bothello1/pkg');

const ctx: Worker = self as any;

ctx.addEventListener('message', (event) => {
    let message: Message = event.data;

    if (message.type === 'get move') {
        const {turn, board, config} = message;
        const depth = typeof config.depth === 'number' ? config.depth : 10;

        run_get_move(board, depth)
            .then((index) => {
                const response: Message = {
                    type: 'new move',
                    index,
                    turn,
                };
                ctx.postMessage(response);
            })
    }
});

async function run_get_move(board: number[], depth: number): Promise<number | undefined> {
    const {get_move} = await ai;
    return get_move(new Uint8Array(board), depth)
}
