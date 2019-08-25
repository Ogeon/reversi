import * as React from 'react';
import { Game } from './views/game/Game';
import { ModalContextProvider } from './components/modal/ModalContextProvider';

export function App() {
    return (
        <ModalContextProvider>
            <Game />
        </ModalContextProvider>
    );
}
