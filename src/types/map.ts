export type MapVariant = 'classic' | 'reversed';

/** A map the MapChip can pick, with its games per version. */
export interface MapChipOption {
    /** base map key: classic and reversed versions together */
    key: string;
    /** a raw NK id, for the name and the image override */
    map: string;
    image?: string | null | undefined;
    count: number;
    variants: { variant: MapVariant; count: number }[];
}
