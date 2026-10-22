import type { ReactNode } from 'react';

interface NoteProps {
    children: ReactNode;
}

/** A soft paragraph under a table or a summary. */
export default function Note(props: NoteProps) {
    const { children } = props;

    return <p className='note'>{children}</p>;
}
