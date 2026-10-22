import type { ReactNode } from 'react';

interface PanelEmptyProps {
    className?: string;
    children: ReactNode;
}

/** Soft text for a panel (or a part of one) with nothing to show. */
export default function PanelEmpty(props: PanelEmptyProps) {
    const { className, children } = props;

    return <p className={className ? `panel__empty ${className}` : 'panel__empty'}>{children}</p>;
}
