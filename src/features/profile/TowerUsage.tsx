import Panel from '@/components/panel/Panel';
import PanelEmpty from '@/components/panel/PanelEmpty';
import { HERO_BASES } from '@/config/profile';
import type { Tower } from '@/types/profile';
import { formatLabel, formatNumber } from '@/utils/format';
import { formatHero } from '@/utils/hero';
import { heroPicture, towerPicture } from '@/utils/unitImages';

interface TowerUsageProps {
    towers: Tower[];
    /** the heroes' card instead of the towers' */
    heroes?: boolean;
}

/** Heroes come as their base ("Quincy") or a skin ("Quincy_Cyber"); towers have no skins. */
const isHero = (type: string) => type.includes('_') || HERO_BASES.includes(type);

export default function TowerUsage(props: TowerUsageProps) {
    const { towers, heroes = false } = props;

    const used = towers
        .filter((t) => t.used > 0 && isHero(t.type) === heroes)
        .sort((a, b) => b.used - a.used);
    const max = used[0]?.used ?? 1;

    return (
        <Panel title={heroes ? 'Most played heroes' : 'Most played towers'}>
            {used.length === 0 ? (
                <PanelEmpty>
                    {heroes ? 'No hero usage recorded yet.' : 'No tower usage recorded yet.'}
                </PanelEmpty>
            ) : (
                <ol
                    className='tower-usage'
                    tabIndex={0}
                    aria-label={heroes ? 'Heroes, most played first' : 'Towers, most played first'}
                >
                    {used.map((tower) => {
                        const picture = heroes ? heroPicture(tower.type) : towerPicture(tower.type);
                        return (
                            <li key={tower.type} className='tower-usage__item'>
                                {picture ? (
                                    <img className='tower-usage__picture' src={picture} alt='' />
                                ) : (
                                    <span className='tower-usage__picture' aria-hidden='true' />
                                )}
                                <span className='tower-usage__name'>
                                    {heroes ? formatHero(tower.type) : formatLabel(tower.type)}
                                </span>
                                <span className='tower-usage__count'>
                                    {formatNumber(tower.used)}
                                </span>
                                <span className='tower-usage__track' aria-hidden='true'>
                                    <span
                                        className='tower-usage__fill'
                                        style={{ width: `${(tower.used / max) * 100}%` }}
                                    />
                                </span>
                            </li>
                        );
                    })}
                </ol>
            )}
        </Panel>
    );
}
