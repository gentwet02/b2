import useSplitMaps from '@/hooks/useSplitMaps';

/** "Split reversed maps": one setting for every map list of the page, remembered. */
export default function SplitMapsToggle() {
    const [split, setSplit] = useSplitMaps();
    return (
        <label className='split-maps-toggle'>
            <input
                type='checkbox'
                checked={split}
                onChange={(event) => setSplit(event.target.checked)}
            />
            Split reversed maps
        </label>
    );
}
