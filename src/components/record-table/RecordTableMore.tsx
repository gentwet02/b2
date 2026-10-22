import { formatNumber } from '@/utils/format';

interface RecordTableMoreProps {
    /** rows the next click adds */
    next: number;
    /** rows still hidden */
    left: number;
    onClick: () => void;
}

/** "Show 50 more (120 left)", under the rows. */
export default function RecordTableMore(props: RecordTableMoreProps) {
    const { next, left, onClick } = props;

    return (
        <button type='button' className='record-table__more' onClick={onClick}>
            Show {next} more ({formatNumber(left)} left)
        </button>
    );
}
