import type { StatDetail } from '@/types/profile';

interface StatDetailsProps {
    details: StatDetail[];
}

/** The label / value grid at the bottom of a stat card. */
export default function StatDetails(props: StatDetailsProps) {
    const { details } = props;

    return (
        <dl className='stats-panel__details'>
            {details.map((d) => (
                <div key={d.label} className='stats-panel__detail'>
                    <dt>{d.label}</dt>
                    <dd className={d.className}>{d.value}</dd>
                </div>
            ))}
        </dl>
    );
}
