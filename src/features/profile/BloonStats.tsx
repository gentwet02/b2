import type { BloonStat } from '@/types/profile';
import { formatLabel, formatNumber } from '@/utils/format';

export default function BloonStats({ bloons }: { bloons: BloonStat[] }) {
    const top = [...bloons].sort((a, b) => b.sends - a.sends).slice(0, 10);

    return (
        <section className='profile-panel'>
            <h2 className='profile-panel__title'>Bloons sent and popped</h2>
            {top.length === 0 ? (
                <p className='profile-panel__empty'>No bloon stats recorded yet.</p>
            ) : (
                <table className='bloon-stats'>
                    <thead>
                        <tr>
                            <th scope='col'>Bloon</th>
                            <th scope='col'>Sent</th>
                            <th scope='col'>Popped</th>
                        </tr>
                    </thead>
                    <tbody>
                        {top.map((bloon) => (
                            <tr key={bloon.bloon_type}>
                                <th scope='row'>{formatLabel(bloon.bloon_type)}</th>
                                <td>{formatNumber(bloon.sends)}</td>
                                <td>{formatNumber(bloon.pops)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
