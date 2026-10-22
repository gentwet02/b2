import { useMemo } from 'react';
import useSplitMaps from '@/hooks/useSplitMaps';
import type { H2hSummary, Labels } from '@/types/compare';
import { mergeMapVersions } from '@/utils/map';
import { pickExtremes } from '@/utils/record';
import H2hTile from './H2hTile';
import SplitMapsToggle from './SplitMapsToggle';

interface H2hHighlightsProps {
    summary: H2hSummary;
    labels: Labels;
    /** games needed for a best / worst */
    min: number;
}

/**
 * Maps and loadouts of the games against one opponent (or all of them):
 * records are the profile player's, on their loadouts and against the opponent's.
 */
export default function H2hHighlights(props: H2hHighlightsProps) {
    const { summary, labels, min } = props;

    const need = `Needs ${min}+ games on one`;
    const [split] = useSplitMaps();
    // classic and reversed versions of a map together, unless split
    const merged = useMemo(() => mergeMapVersions(summary.maps, labels), [summary.maps, labels]);
    const maps = useMemo(
        () =>
            split || !merged.hasReversed
                ? { best: summary.best.map, worst: summary.worst.map, labels }
                : { ...pickExtremes(merged.maps, min), labels: merged.labels },
        [split, merged, summary.best.map, summary.worst.map, labels, min],
    );

    return (
        <div className='h2h-highlights-wrap'>
            {merged.hasReversed && <SplitMapsToggle />}
            <div className='h2h-highlights'>
                <H2hTile
                    label='Best map'
                    kind='map'
                    pick={maps.best}
                    labels={maps.labels}
                    empty={`${need} map`}
                />
                <H2hTile
                    label='Your best loadout'
                    kind='loadout'
                    pick={summary.best.mine}
                    labels={labels}
                    empty={`${need} loadout`}
                />
                <H2hTile
                    label='Their loadout you beat most'
                    kind='loadout'
                    pick={summary.best.theirs}
                    labels={labels}
                    empty={`${need} loadout of theirs`}
                />
                <H2hTile
                    label='Worst map'
                    kind='map'
                    pick={maps.worst}
                    labels={maps.labels}
                    empty={`${need} more map`}
                />
                <H2hTile
                    label='Your worst loadout'
                    kind='loadout'
                    pick={summary.worst.mine}
                    labels={labels}
                    empty={`${need} more loadout`}
                />
                <H2hTile
                    label='Their loadout that beats you'
                    kind='loadout'
                    pick={summary.worst.theirs}
                    labels={labels}
                    empty={`${need} more loadout of theirs`}
                />
            </div>
        </div>
    );
}
