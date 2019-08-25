use crate::board::Board;

const UL_SIDES_MASK: u64 = 0x1010101010101ff; //1 along the upper and left sides
const UR_SIDES_MASK: u64 = 0x80808080808080ff; //1 along the upper and right sides
const LL_SIDES_MASK: u64 = 0xff01010101010101; //1 along the lower and left sides
const LR_SIDES_MASK: u64 = 0xff80808080808080; //1 along the lower and right sides
const AROUND_CORNER_MASK: u64 = 0x42c300000000c342; //1 on the tiles connected to the corners

pub fn get_move(board: Board, depth: u8) -> Option<usize> {
    if depth == 0 {
        return None;
    }

    let mut best_position = None;
    let mut score = -std::i32::MAX;
    let mut best_score = score;

    for index in 0..64usize {
        if let Ok(new_board) = board.place_piece(index) {
            score = score.max(-alphabeta(
                new_board.swapped(),
                depth - 1,
                -std::i32::MAX,
                -score,
            ));

            if score > best_score {
                best_score = score;
                best_position = Some(index);
            }
        }
    }

    best_position
}

fn alphabeta(board: Board, depth: u8, mut alpha: i32, beta: i32) -> i32 {
    if depth == 0 {
        return heuristics(board);
    }

    let mut made_a_move = false;

    for index in 0..64usize {
        if let Ok(new_board) = board.place_piece(index) {
            alpha = alpha.max(-alphabeta(new_board.swapped(), depth - 1, -beta, -alpha));
            made_a_move = true;
            if beta <= alpha {
                break;
            }
        }
    }

    if !made_a_move {
        win_heuristics(board)
    } else {
        alpha
    }
}

fn win_heuristics(board: Board) -> i32 {
    let player_score = board.player_score() as i32;
    let opponent_score = board.opponent_score() as i32;
    if player_score > opponent_score {
        1000 * (player_score - opponent_score)
    } else {
        -200000
    }
}

fn heuristics(board: Board) -> i32 {
    let mut score = board.opponent_score() as i32 - board.player_score() as i32;

    score += corner_and_sides_heuristics(board.get_player()) << 2;
    score -= corner_and_sides_heuristics(board.get_opponent());

    score + ((board.get_opponent() & AROUND_CORNER_MASK).count_ones() as i32) << 2
}

fn corner_and_sides_heuristics(pieces: u64) -> i32 {
    let mut score = 0;

    //upper left
    if pieces & 1 != 0 {
        score += 50;
        score += ((pieces & UL_SIDES_MASK).count_ones() as i32) << 2;
    }

    //upper right
    if pieces & 128 != 0 {
        score += 50;
        score += ((pieces & UR_SIDES_MASK).count_ones() as i32) << 2;
    }

    //lower left
    if pieces & 0x100000000000000 != 0 {
        score += 50;
        score += ((pieces & LL_SIDES_MASK).count_ones() as i32) << 2;
    }

    //lower right
    if pieces & 0x8000000000000000 != 0 {
        score += 50;
        score += ((pieces & LR_SIDES_MASK).count_ones() as i32) << 2;
    }

    score
}
