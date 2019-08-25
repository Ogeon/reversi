import * as React from 'react';
import { useModalStateTracking } from './ModalContext';
import { createPortal } from 'react-dom';

import * as styles from './Modal.scss';

interface Props {
    open: boolean;
    children: React.ReactNode;
}

export function Modal(props: Props) {
    const {open, children} = props;

    useModalStateTracking(open);

    if (!open) {
        return null;
    }

    return createPortal(
        <div className={styles.dimmer}>
            <div>
                {children}
            </div>
        </div>,
        document.getElementById('modals')!
    );
}
