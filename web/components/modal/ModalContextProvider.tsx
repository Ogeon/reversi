import * as React from 'react';
import { ModalContext } from './ModalContext';

interface Props {
    children: React.ReactNode;
}

export function ModalContextProvider(props: Props) {
    const {children} = props;

    const [currentModals, setCurrentModals] = React.useState<Set<symbol>>(() => new Set());

    const openModal = React.useCallback((id: symbol) => {
        setCurrentModals((currentModals) => {
            const newModals = new Set(currentModals);
            newModals.add(id);
            return newModals;
        })
    }, [setCurrentModals]);

    const closeModal = React.useCallback((id: symbol) => {
        setCurrentModals((currentModals) => {
            const newModals = new Set(currentModals);
            newModals.delete(id);
            return newModals;
        })
    }, [setCurrentModals]);

    const content = React.useMemo(() => ({currentModals, openModal, closeModal}), [currentModals, openModal, closeModal]);

    return <ModalContext.Provider value={content}>{children}</ModalContext.Provider>;
}
