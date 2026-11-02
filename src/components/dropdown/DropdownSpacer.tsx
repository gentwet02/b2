import { createPortal } from 'react-dom';

interface DropdownSpacerProps {
    /** page offset of the list's bottom */
    top: number;
}

/**
 * An invisible block under the open list (which is positioned absolutely), so the page
 * grows and can scroll to the list's end.
 */
export default function DropdownSpacer(props: DropdownSpacerProps) {
    const { top } = props;

    return createPortal(
        <div
            aria-hidden='true'
            style={{
                position: 'absolute',
                insetInline: 0,
                insetBlockStart: top,
                blockSize: '1rem',
                pointerEvents: 'none',
            }}
        />,
        document.getElementById('root') ?? document.body,
    );
}
