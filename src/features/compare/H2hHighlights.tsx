import { useMemo } from 'react';
import { useSplitHeroes, useSplitMaps } from '@/hooks/useSplitVariants';
import type { H2hSummary, Labels } from '@/types/compare';
import { withVariantLabels } from '@/utils/loadout';
import H2hTile from './H2hTile';

interface H2hHighlightsProps {
    summary: H2hSummary;
    labels: Labels;
    /** games needed for a best / worst */
    min: number;
}

/**
 * Maps and loadouts of the games against one opponent (or all of them):
 * records are the profile player's, on their loadouts and against the opponent's.
 * Variants apart or together as the URL says (`variants` missing: an older server, together).
 */
export default function H2hHighlights(props: H2hHighlightsProps) {
    const { summary, labels, min } = props;

    const need = `Needs ${min}+ games on one`;
    const [splitMaps] = useSplitMaps();
    const [splitHeroes] = useSplitHeroes();
    const apart = summary.variants;
    const maps = (splitMaps && apart) || summary;
    const loadouts = (splitHeroes && apart) || summary;
    const variantLabels = useMemo(() => withVariantLabels(labels), [labels]);
    const loadoutLabels = splitHeroes && apart ? variantLabels : labels;

    return (
        <div className='h2h-highlights'>
            <H2hTile
                label='Best map'
                kind='map'
                pick={maps.best.map}
                labels={labels}
                empty={`${need} map`}
            />
            <H2hTile
                label='Your best loadout'
                kind='loadout'
                pick={loadouts.best.mine}
                labels={loadoutLabels}
                empty={`${need} loadout`}
            />
            <H2hTile
                label='Their loadout you beat most'
                kind='loadout'
                pick={loadouts.best.theirs}
                labels={loadoutLabels}
                empty={`${need} loadout of theirs`}
            />
            <H2hTile
                label='Worst map'
                kind='map'
                pick={maps.worst.map}
                labels={labels}
                empty={`${need} more map`}
            />
            <H2hTile
                label='Your worst loadout'
                kind='loadout'
                pick={loadouts.worst.mine}
                labels={loadoutLabels}
                empty={`${need} more loadout`}
            />
            <H2hTile
                label='Their loadout that beats you'
                kind='loadout'
                pick={loadouts.worst.theirs}
                labels={loadoutLabels}
                empty={`${need} more loadout of theirs`}
            />
        </div>
    );
}
