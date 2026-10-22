import type { Badge } from '@/types/profile';
import { formatLabel } from '@/utils/format';

const IMAGE_URL = /^https?:\/\/\S+\.(png|jpe?g|webp|gif|svg)(\?\S*)?$/i;

/** Equipped badges, read defensively (see Badge). */
export function readBadges(raw: unknown[] | undefined): Badge[] {
    return (raw ?? []).flatMap((item, i): Badge[] => {
        if (typeof item === 'string') {
            return IMAGE_URL.test(item)
                ? [{ key: `b${i}`, url: item, name: 'Badge' }]
                : [{ key: `b${i}`, name: formatLabel(item) }];
        }
        if (item && typeof item === 'object') {
            const values = Object.entries(item as Record<string, unknown>);
            const url = values.find(([, v]) => typeof v === 'string' && IMAGE_URL.test(v))?.[1] as
                string | undefined;
            const nameField = values.find(
                ([k, v]) => typeof v === 'string' && /^(name|badge|type|id)$/i.test(k),
            )?.[1] as string | undefined;
            const name = nameField ? formatLabel(nameField) : 'Badge';
            return url || nameField ? [{ key: `b${i}`, url, name }] : [];
        }
        return [];
    });
}
