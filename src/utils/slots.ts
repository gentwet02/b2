import type { OpponentSlot } from '@/types/compare';

/**
 * The slots of a head to head card: the first `count` of `ranked` (without `self`), where
 * every slot the visitor replaced (`overrides`, by slot index) shows their pick instead.
 * None when there is nobody ranked.
 */
export function fillSlots(
    ranked: string[],
    overrides: readonly (string | null)[],
    self: string,
    count: number,
): OpponentSlot[] {
    const others = ranked.filter((id) => id !== self);
    if (others.length === 0) return [];

    // picks first, so a default never duplicates one of them
    const taken = new Set<string>();
    const picks = overrides.map((id) => {
        if (!id || id === self || taken.has(id)) return null;
        taken.add(id);
        return id;
    });
    const defaults = others.slice(0, count);
    // a slot whose default was moved elsewhere takes the next one after the first `count`
    // (not one the visitor replaced)
    const spare = others.slice(count);

    const slots: OpponentSlot[] = [];
    for (let index = 0; index < count; index++) {
        const pick = picks[index];
        if (pick) {
            slots.push({ index, id: pick, custom: true });
            continue;
        }
        // this slot's default, unless a pick elsewhere already shows it
        const own = defaults[index];
        const id = own && !taken.has(own) ? own : spare.find((s) => !taken.has(s));
        if (!id) continue;
        taken.add(id);
        slots.push({ index, id, custom: false });
    }
    return slots;
}
