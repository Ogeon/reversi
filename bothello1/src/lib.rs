use wasm_bindgen::prelude::*;

mod alphabeta;
mod board;

#[wasm_bindgen]
pub fn get_move(current_board: &[u8], depth: u8) -> Option<u8> {
    let board = board::Board::from(current_board);
    alphabeta::get_move(board, depth).and_then(
        |index| {
            if index < 64 {
                Some(index as u8)
            } else {
                None
            }
        },
    )
}
