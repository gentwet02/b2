import type { Tower } from '@/types/profile';
import { formatLabel, formatNumber } from '@/utils/format';

export default function TowerUsage({ towers }: { towers: Tower[] }) {
    const used = towers.filter((t) => t.used > 0).sort((a, b) => b.used - a.used);
    const top = used.slice(0, 10);
    const max = top[0]?.used ?? 1;

    return (
        <section className='profile-panel'>
            <h2 className='profile-panel__title'>Most played towers</h2>
            {top.length === 0 ? (
                <p className='profile-panel__empty'>No tower usage recorded yet.</p>
            ) : (
                <ol className='tower-usage'>
                    {top.map((tower) => (
                        <li key={tower.type} className='tower-usage__item'>
                            <span className='tower-usage__name'>{formatLabel(tower.type)}</span>
                            <span className='tower-usage__count'>{formatNumber(tower.used)}</span>
                            <span className='tower-usage__track' aria-hidden='true'>
                                <span
                                    className='tower-usage__fill'
                                    style={{ width: `${(tower.used / max) * 100}%` }}
                                />
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
