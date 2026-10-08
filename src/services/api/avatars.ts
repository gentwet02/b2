import { getFromApi, toError } from '@/services/api/utils';

export interface AvatarsResponse {
    avatars: Record<string, string>;
    pending: string[];
    message?: string | null;
    error?: string | null;
}

export interface AvatarResult {
    url: string | null;
    pending: boolean;
}

const BATCH_MS = 40;
const MAX_IDS = 100;

type Waiter = { resolve: (r: AvatarResult) => void; reject: (e: unknown) => void };

let queue = new Map<string, Waiter[]>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function send(ids: string[], waiters: Map<string, Waiter[]>) {
    try {
        const response = await getFromApi<AvatarsResponse>(
            `avatars?ids=${ids.map(encodeURIComponent).join(',')}`,
        );
        if (!response.success || !response.data) {
            throw toError(response, 'Could not load the avatars');
        }
        const { avatars, pending } = response.data;
        const waiting = new Set(pending);
        for (const id of ids) {
            const result = { url: avatars[id] ?? null, pending: waiting.has(id) };
            for (const w of waiters.get(id) ?? []) w.resolve(result);
        }
    } catch (error) {
        for (const id of ids) for (const w of waiters.get(id) ?? []) w.reject(error);
    }
}

function flush() {
    const batch = queue;
    queue = new Map();
    timer = null;
    const ids = [...batch.keys()];
    for (let i = 0; i < ids.length; i += MAX_IDS) void send(ids.slice(i, i + MAX_IDS), batch);
}

/**
 * One player's avatar. Calls made in the same moment (every row of a page mounting)
 * are grouped into a single request.
 */
export function loadAvatar(id: string): Promise<AvatarResult> {
    return new Promise((resolve, reject) => {
        const waiters = queue.get(id) ?? [];
        waiters.push({ resolve, reject });
        queue.set(id, waiters);
        timer ??= setTimeout(flush, BATCH_MS);
    });
}
