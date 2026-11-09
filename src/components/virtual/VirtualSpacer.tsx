interface VirtualSpacerProps {
    /** px */
    size: number;
    /** the table's column count */
    columns: number;
}

/** A table row standing in for the rows a virtual table doesn't render. */
export default function VirtualSpacer(props: VirtualSpacerProps) {
    const { size, columns } = props;

    if (size <= 0) return null;

    return (
        <tr className='virtual-spacer' aria-hidden='true'>
            <td colSpan={columns} className='virtual-spacer__cell' style={{ blockSize: size }} />
        </tr>
    );
}
