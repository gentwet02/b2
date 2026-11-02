import { useMemo } from 'react';
import { useSplitHeroes, useSplitMaps } from '@/hooks/useSplitVariants';
import type { H2hPick, H2hSummary, Labels } from '@/types/compare';
import { withVariantLabels } from '@/utils/loadout';
import { gamesOf } from '@/utils/record';
import H2hTile from './H2hTile';

interface H2hHighlightsProps {
    summary: H2hSummary;
    labels: Labels;
    /** games needed for a best / worst */
    min: number;
    /** the two sides, possessive ("Bob’s", "Top 10"); without: "your" and "their" (profile) */
    names?: { mine: string; theirs: string } | undefined;
    /**
     * The same players on both sides, counted on both: every map is at 50%, so the map
     * tiles show the most and least played maps of these (classic and reversed as split).
     */
    playedMaps?: H2hPick[] | undefined;
}

/**
 * Maps and loadouts of the games against one opponent (or all of them):
 * records are the profile player's, on their loadouts and against the opponent's.
 * Variants apart or together as the URL says (`variants` missing: an older server, together).
 */
export default function H2hHighlights(props: H2hHighlightsProps) {
    const { summary, labels, min, names, playedMaps } = props;

    const titles = names
        ? {
              bestMine: `${names.mine} best loadout`,
              bestTheirs: `${names.theirs} loadout beaten most`,
              worstMine: `${names.mine} worst loadout`,
              worstTheirs: `${names.theirs} loadout that wins most`,
          }
        : {
              bestMine: 'Your best loadout',
              bestTheirs: 'Their loadout you beat most',
              worstMine: 'Your worst loadout',
              worstTheirs: 'Their loadout that beats you',
          };

    // any played map or loadout can be a best or a worst once `min` is 1
    const need = min > 1 ? `Needs ${min}+ games on one` : 'No game on any';
    // the server never picks a 0% best or a 100% worst: say so rather than "no game"
    const [wins, losses] = summary.record;
    const bestEmpty = (what: string) =>
        wins === 0 && losses > 0 ? 'No win yet' : `${need} ${what}`;
    function worstEmpty(what: string) {
        return losses === 0 && wins > 0
            ? 'No loss yet'
            : min > 1
              ? `${need} more ${what}`
              : `Every ${what} at the same win rate`;
    }
    const [splitMaps] = useSplitMaps();
    // the mirror counts each game once from each side: half the record is the games played
    const playedGames = (pick: H2hPick | undefined) =>
        pick ? Math.round(gamesOf(pick.record) / 2) : undefined;
    const [splitHeroes] = useSplitHeroes();
    const apart = summary.variants;
    const maps = (splitMaps && apart) || summary;
    const loadouts = (splitHeroes && apart) || summary;
    const variantLabels = useMemo(() => withVariantLabels(labels), [labels]);
    const loadoutLabels = splitHeroes && apart ? variantLabels : labels;

    return (
        <div className='h2h-highlights'>
            <H2hTile
                label={playedMaps ? 'Most played map' : 'Best map'}
                kind='map'
                pick={playedMaps ? (playedMaps[0] ?? null) : maps.best.map}
                games={playedMaps && playedGames(playedMaps[0])}
                labels={labels}
                empty={bestEmpty('map')}
            />
            <H2hTile
                label={titles.bestMine}
                kind='loadout'
                pick={loadouts.best.mine}
                labels={loadoutLabels}
                empty={bestEmpty('loadout')}
            />
            <H2hTile
                label={titles.bestTheirs}
                kind='loadout'
                pick={loadouts.best.theirs}
                labels={loadoutLabels}
                empty={bestEmpty('loadout of theirs')}
            />
            <H2hTile
                label={playedMaps ? 'Least played map' : 'Worst map'}
                kind='map'
                pick={
                    playedMaps
                        ? playedMaps.length > 1
                            ? (playedMaps[playedMaps.length - 1] ?? null)
                            : null
                        : maps.worst.map
                }
                games={playedMaps && playedGames(playedMaps[playedMaps.length - 1])}
                labels={labels}
                empty={playedMaps ? 'Only one map played' : worstEmpty('map')}
            />
            <H2hTile
                label={titles.worstMine}
                kind='loadout'
                pick={loadouts.worst.mine}
                labels={loadoutLabels}
                empty={worstEmpty('loadout')}
            />
            <H2hTile
                label={titles.worstTheirs}
                kind='loadout'
                pick={loadouts.worst.theirs}
                labels={loadoutLabels}
                empty={worstEmpty('loadout of theirs')}
            />
        </div>
    );
}
