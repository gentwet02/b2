interface StatsSummaryItemProps {
    value: string;
    label: string;
    /** on the value, e.g. "5 won, 1 drawn, 3 lost" */
    title?: string;
}

/** A big number over its label. */
export default function StatsSummaryItem(props: StatsSummaryItemProps) {
    const { value, label, title } = props;

    return (
        <div className='stats-summary__item'>
            <span className='stats-summary__value' title={title}>
                {value}
            </span>
            <span className='stats-summary__label'>{label}</span>
        </div>
    );
}
