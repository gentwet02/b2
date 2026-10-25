import Dropdown from '@/components/dropdown/Dropdown';
import { ALL_SEASONS_OPTION } from '@/config/seasons';
import type { SeasonScope, SeasonSummary } from '@/types/season';
import { seasonOptions } from '@/utils/season';

interface BaseProps {
    seasons: SeasonSummary[];
    /** undefined: the live season */
    value: SeasonScope | undefined;
    liveSeason: number | undefined;
    id?: string;
    className?: string;
    variant?: 'default' | 'compact';
    placeholder?: string;
}

/** `urlSeason` keeps the live season out of the URL. */
type SeasonSelectProps = BaseProps &
    (
        | {
              /** an "All seasons" option first */ allowAll: true;
              onChange: (season: SeasonScope) => void;
          }
        | { allowAll?: false; onChange: (season: number) => void }
    );

export default function SeasonSelect(props: SeasonSelectProps) {
    const { seasons, value, liveSeason, ...dropdown } = props;

    const options = [
        ...(props.allowAll ? [ALL_SEASONS_OPTION] : []),
        ...seasonOptions(seasons, !!props.allowAll).map((o) => ({ ...o, value: String(o.value) })),
    ];
    const current = value ?? liveSeason;

    const select = (next: string) => {
        if (props.allowAll) props.onChange(next === 'all' ? 'all' : Number(next));
        else props.onChange(Number(next));
    };

    return (
        <Dropdown
            aria-label='Season'
            id={dropdown.id}
            className={dropdown.className}
            variant={dropdown.variant}
            placeholder={dropdown.placeholder}
            options={options}
            value={current === undefined ? '' : String(current)}
            onSelect={select}
        />
    );
}
