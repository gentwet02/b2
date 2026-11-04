import useOldNamesSearch, { setOldNamesSearch } from '@/hooks/useOldNamesSearch';
import ControlCheckbox from './ControlCheckbox';

/** "Include old names" for the player pickers; the choice is shared by all of them. */
export default function OldNamesCheckbox() {
    const on = useOldNamesSearch();

    return (
        <ControlCheckbox checked={on} onChange={setOldNamesSearch}>
            <span title='Also find players by the names they went by before'>
                Include old names
            </span>
        </ControlCheckbox>
    );
}
