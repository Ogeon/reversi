import * as React from 'react';

interface ModalContextContent {
    currentModals: Set<symbol>;
    openModal: (id: symbol) => void;
    closeModal: (id: symbol) => void;
}

export const ModalContext = React.createContext<ModalContextContent | undefined>(undefined);

export function useAreModalsOpen() {
    const {currentModals} = React.useContext(ModalContext) || requireProvider();
    return !!currentModals.size;
}

export function useModalStateTracking(open: boolean) {
    const {openModal, closeModal} = React.useContext(ModalContext) || requireProvider();
    const id = React.useRef(Symbol());

    React.useEffect(() => {
        if (open) {
            openModal(id.current);
        } else {
            closeModal(id.current);
        }

        return () => closeModal(id.current);
    }, [id, open]);
}

function requireProvider(): never {
    throw new Error('ModalContext can only be used within a ModalContextProvider');
}
