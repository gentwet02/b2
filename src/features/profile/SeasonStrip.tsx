import type { ReactNode } from 'react';
import type { UserProfile } from '@/types/profile';
import { arenaName } from '@/utils/badges';
import { formatNumber } from '@/utils/format';
import { arenaPicture } from '@/utils/unitImages';

interface SeasonStripProps {
    profile: UserProfile;
    /** two tiles per row, for a half-width card */
    compact?: boolean;
}

/** An arena's logo and name, "None yet" without one. */
function arena(code: string | undefined): ReactNode {
    if (!code) return 'None yet';
    const logo = arenaPicture(code);
    return (
        <span className='season-strip__arena'>
            {logo && <img className='season-strip__arena-logo' src={logo} alt='' />}
            {arenaName(code)}
        </span>
    );
}

export default function SeasonStrip(props: SeasonStripProps) {
    const { profile, compact = false } = props;

    const tiles = [
        {
            label: 'Trophies this season',
            value: formatNumber(profile.currentSeason_trophies ?? 0),
        },
        {
            label: 'Best arena this season',
            value: arena(profile.currentSeason_highestArena),
        },
        { label: 'Lifetime trophies', value: formatNumber(profile.lifetime_trophies ?? 0) },
        {
            label: 'Best arena ever',
            value: arena(profile.lifetime_highestArena),
        },
    ];

    return (
        <dl className={`season-strip${compact ? ' season-strip--compact' : ''}`}>
            {tiles.map((tile) => (
                <div key={tile.label} className='season-strip__tile'>
                    <dt className='season-strip__label'>{tile.label}</dt>
                    <dd className='season-strip__value'>{tile.value}</dd>
                </div>
            ))}
        </dl>
    );
}
