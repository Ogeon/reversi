/// Represents the pieces on the board as 1 bits in two 64 bit integers.
/// One for each player. Note that the board is encoded "backwards", compared
/// to the input format.
#[cfg_attr(test, derive(PartialEq, Eq, Debug))]
pub struct Board {
    player_pieces: u64,
    opponent_pieces: u64,
}

impl Board {
    #[inline]
    pub fn swapped(&self) -> Board {
        Board {
            player_pieces: self.opponent_pieces,
            opponent_pieces: self.player_pieces,
        }
    }

    #[inline]
    pub fn get_player(&self) -> u64 {
        self.player_pieces
    }

    #[inline]
    pub fn get_opponent(&self) -> u64 {
        self.opponent_pieces
    }

    #[inline]
    pub fn player_score(&self) -> u32 {
        self.player_pieces.count_ones()
    }

    #[inline]
    pub fn opponent_score(&self) -> u32 {
        self.opponent_pieces.count_ones()
    }

    pub fn place_piece(&self, index: usize) -> Result<Board, ()> {
        if index >= 64 {
            return Err(());
        }

        let cursor = 1 << index;

        if (self.player_pieces | self.opponent_pieces) & cursor != 0 {
            return Err(());
        }

        let mut mask = 0u64;

        let y = index / 8;
        let x = index - (y * 8);

        if x < 7 {
            mask |= self.flip_pieces_left(cursor, 1, 7 - x);

            if y < 7 {
                mask |= self.flip_pieces_left(cursor, 9, (7 - x).min(7 - y));
            }

            if y > 0 {
                mask |= self.flip_pieces_right(cursor, 7, (7 - x).min(y));
            }
        }

        if x > 0 {
            mask |= self.flip_pieces_right(cursor, 1, x);

            if y > 0 {
                mask |= self.flip_pieces_right(cursor, 9, x.min(y));
            }

            if y < 7 {
                mask |= self.flip_pieces_left(cursor, 7, x.min(7 - y));
            }
        }

        if y < 7 {
            mask |= self.flip_pieces_left(cursor, 8, 7 - y);
        }

        if y > 0 {
            mask |= self.flip_pieces_right(cursor, 8, y);
        }

        if mask != 0 {
            Ok(Board {
                // Combines the flip mask with the placed piece
                player_pieces: self.player_pieces | mask | cursor,
                opponent_pieces: self.opponent_pieces & !mask,
            })
        } else {
            // Illegal move
            Err(())
        }
    }

    fn flip_pieces_left(&self, mut cursor: u64, shift: usize, steps: usize) -> u64 {
        let mut line_mask = 0;

        for _ in 0..steps {
            cursor <<= shift;

            if self.opponent_pieces & cursor != 0 {
                // Mark their piece for flipping
                line_mask |= cursor;
            } else if self.player_pieces & cursor != 0 {
                // Reached one of our pieces, so return the marked opponent pieces
                return line_mask;
            } else {
                // Didn't reach any of our pieces, so do nothing
                return 0;
            }
        }

        // Reached the edge of the board, so do nothing
        0
    }

    fn flip_pieces_right(&self, mut cursor: u64, shift: usize, steps: usize) -> u64 {
        let mut line_mask = 0;

        for _ in 0..steps {
            cursor >>= shift;

            if self.opponent_pieces & cursor != 0 {
                // Mark their piece for flipping
                line_mask |= cursor;
            } else if self.player_pieces & cursor != 0 {
                // Reached one of our pieces, so return the marked opponent pieces
                return line_mask;
            } else {
                // Didn't reach any of our pieces, so do nothing
                return 0;
            }
        }

        // Reached the edge of the board, so do nothing
        0
    }
}

impl From<&[u8]> for Board {
    fn from(spaces: &[u8]) -> Board {
        let mut board = Board {
            player_pieces: 0,
            opponent_pieces: 0,
        };

        for (i, &space) in spaces.iter().enumerate() {
            if i >= 64 {
                break;
            }

            let cursor = 1 << i;

            match space {
                1 => board.player_pieces |= cursor,
                2 => board.opponent_pieces |= cursor,
                _ => {}
            }
        }

        board
    }
}

#[cfg(test)]
mod tests {
    use super::Board;

    #[test]
    fn parsing() {
        #[cfg_attr(rustfmt, rustfmt_skip)]
        let pieces: &[u8] = &[
            1, 1, 1, 1, 1, 1, 1, 1,
            2, 2, 2, 2, 2, 2, 2, 2,
            0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 2, 2, 2, 2,
            1, 1, 1, 1, 1, 1, 1, 1,
            2, 2, 2, 2, 2, 2, 2, 2,
            0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 2, 2, 2, 2u8,
        ];
        let board = Board::from(pieces);
        let expected_board = Board {
            player_pieces: 0x0F0000FF0F0000FF,
            opponent_pieces: 0xF000FF00F000FF00,
        };

        assert_eq!(board, expected_board);
    }

    #[test]
    fn swap_players() {
        #[cfg_attr(rustfmt, rustfmt_skip)]
        let pieces: &[u8] = &[
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 2, 2, 2, 2,
            2, 2, 2, 2, 1, 1, 1, 1,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0u8,
        ];
        let board = Board::from(pieces);

        #[cfg_attr(rustfmt, rustfmt_skip)]
        let expected_pieces: &[u8] = &[
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            2, 2, 2, 2, 1, 1, 1, 1,
            1, 1, 1, 1, 2, 2, 2, 2,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0u8,
        ];
        let expected_board = Board::from(expected_pieces);

        let swapped_board = board.swapped();
        assert_eq!(swapped_board, expected_board);
    }

    #[test]
    fn legal_move() {
        #[cfg_attr(rustfmt, rustfmt_skip)]
        let pieces: &[u8] = &[
            1, 0, 0, 1, 0, 0, 0, 0,
            0, 2, 0, 2, 0, 1, 0, 0,
            0, 0, 2, 2, 2, 0, 0, 0,
            1, 2, 2, 0, 2, 2, 2, 1,
            0, 2, 2, 2, 2, 2, 2, 1,
            0, 2, 0, 1, 0, 2, 0, 0,
            1, 0, 0, 0, 0, 0, 2, 0,
            0, 0, 0, 0, 0, 0, 0, 1u8,
        ];
        let board = Board::from(pieces);

        #[cfg_attr(rustfmt, rustfmt_skip)]
        let expected_pieces: &[u8] = &[
            1, 0, 0, 1, 0, 0, 0, 0,
            0, 1, 0, 1, 0, 1, 0, 0,
            0, 0, 1, 1, 1, 0, 0, 0,
            1, 1, 1, 1, 1, 1, 1, 1,
            0, 2, 1, 1, 1, 2, 2, 1,
            0, 1, 0, 1, 0, 1, 0, 0,
            1, 0, 0, 0, 0, 0, 1, 0,
            0, 0, 0, 0, 0, 0, 0, 1u8,
        ];
        let expected_board = Board::from(expected_pieces);

        let new_board = board.place_piece(27).expect("expected a legal move");

        assert_eq!(new_board, expected_board);
    }

    #[test]
    fn nothing_to_flip() {
        #[cfg_attr(rustfmt, rustfmt_skip)]
        let pieces: &[u8] = &[
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 2, 0, 2, 0, 2, 0, 0,
            0, 0, 2, 2, 2, 0, 0, 0,
            2, 2, 2, 0, 2, 2, 2, 2,
            0, 2, 2, 0, 2, 2, 2, 1,
            0, 2, 0, 0, 0, 2, 0, 0,
            2, 0, 0, 0, 0, 0, 2, 0,
            0, 0, 0, 0, 0, 0, 0, 2u8,
        ];
        let board = Board::from(pieces);

        assert_eq!(board.place_piece(27), Err(()));
    }

    #[test]
    fn occupied_by_player() {
        #[cfg_attr(rustfmt, rustfmt_skip)]
        let pieces: &[u8] = &[
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 2, 0, 2, 0, 2, 0, 0,
            0, 0, 2, 2, 2, 0, 0, 0,
            2, 2, 2, 1, 2, 2, 2, 2,
            0, 2, 2, 0, 2, 2, 2, 1,
            0, 2, 0, 0, 0, 2, 0, 0,
            2, 0, 0, 0, 0, 0, 2, 0,
            0, 0, 0, 0, 0, 0, 0, 2u8,
        ];
        let board = Board::from(pieces);

        assert_eq!(board.place_piece(27), Err(()));
    }

    #[test]
    fn occupied_by_opponent() {
        #[cfg_attr(rustfmt, rustfmt_skip)]
        let pieces: &[u8] = &[
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 2, 0, 2, 0, 2, 0, 0,
            0, 0, 2, 2, 2, 0, 0, 0,
            2, 2, 2, 2, 2, 2, 2, 2,
            0, 2, 2, 0, 2, 2, 2, 1,
            0, 2, 0, 0, 0, 2, 0, 0,
            2, 0, 0, 0, 0, 0, 2, 0,
            0, 0, 0, 0, 0, 0, 0, 2u8,
        ];
        let board = Board::from(pieces);

        assert_eq!(board.place_piece(27), Err(()));
    }
}
