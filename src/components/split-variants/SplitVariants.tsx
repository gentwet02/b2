import ControlCheckbox from '@/components/controls/ControlCheckbox';
import { useSplitHeroes, useSplitMaps } from '@/hooks/useSplitVariants';

interface SplitVariantsProps {
    /** show the reversed maps checkbox */
    maps?: boolean;
    /** show the hero variants checkbox */
    heroes?: boolean;
    className?: string;
}

/** "Split reversed maps" and "Split hero variants", read from and written to the URL. */
export default function SplitVariants(props: SplitVariantsProps) {
    const { maps = true, heroes = true, className } = props;
    const [splitMaps, setSplitMaps] = useSplitMaps();
    const [splitHeroes, setSplitHeroes] = useSplitHeroes();

    if (!maps && !heroes) return null;
    return (
        <div className={className ? `split-variants ${className}` : 'split-variants'}>
            {maps && (
                <ControlCheckbox checked={splitMaps} onChange={setSplitMaps}>
                    Split reversed maps
                </ControlCheckbox>
            )}
            {heroes && (
                <ControlCheckbox checked={splitHeroes} onChange={setSplitHeroes}>
                    Split hero variants
                </ControlCheckbox>
            )}
        </div>
    );
}
