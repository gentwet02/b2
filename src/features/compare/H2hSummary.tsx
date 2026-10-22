import type { ReactNode } from 'react';
import type { Wld } from '@/types/record';
import { formatRate, rateOf } from '@/utils/record';

interface H2hSummaryProps {
    record: Wld;
    /** the sentence next to the big win rate */
    children: ReactNode;
}

/** A big win rate, then what it's made of. */
export default function H2hSummary(props: H2hSummaryProps) {
    const { record, children } = props;

    return (
        <div className='h2h-summary'>
            <span className='h2h-summary__rate'>{formatRate(rateOf(record))}</span>
            <span className='h2h-summary__text'>{children}</span>
        </div>
    );
}
