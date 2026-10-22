import { formatRate } from '@/utils/record';

interface RateBarProps {
    /** win rate in % (null: no win or loss, a dash) */
    rate: number | null;
    digits?: number;
    /** e.g. "5 won, 1 drawn, 3 lost" */
    title?: string | undefined;
    className?: string;
}

/** "62%" with a bar filled to it. */
export default function RateBar(props: RateBarProps) {
    const { rate, digits = 0, title, className } = props;

    if (rate === null) return <span className='rate-bar__none'>–</span>;
    return (
        <span className={className ? `rate-bar ${className}` : 'rate-bar'} title={title}>
            <span className='rate-bar__value'>{formatRate(rate, digits)}</span>
            <span className='rate-bar__bar' aria-hidden='true'>
                <span style={{ width: `${rate}%` }} />
            </span>
        </span>
    );
}
