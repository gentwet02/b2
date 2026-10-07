import type { UserProfile } from '@/types/profile';
import { formatLabel, formatNumber } from '@/utils/format';

export default function SeasonStrip({ profile }: { profile: UserProfile }) {
    const tiles = [
        {
            label: 'Trophies this season',
            value: formatNumber(profile.currentSeason_trophies ?? 0),
        },
        {
            label: 'Best arena this season',
            value: profile.currentSeason_highestArena
                ? formatLabel(profile.currentSeason_highestArena)
                : 'None yet',
        },
        { label: 'Lifetime trophies', value: formatNumber(profile.lifetime_trophies ?? 0) },
        {
            label: 'Best arena ever',
            value: profile.lifetime_highestArena
                ? formatLabel(profile.lifetime_highestArena)
                : 'None yet',
        },
    ];

    return (
        <dl className='season-strip'>
            {tiles.map((tile) => (
                <div key={tile.label} className='season-strip__tile'>
                    <dt className='season-strip__label'>{tile.label}</dt>
                    <dd className='season-strip__value'>{tile.value}</dd>
                </div>
            ))}
        </dl>
    );
}
