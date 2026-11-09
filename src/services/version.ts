import type { AnyRouter } from '@tanstack/react-router';
import { RELOADED_FOR_KEY, VERSION_CHECK_MS, VERSION_URL } from '@/config/version';

/** Id of a newer deployed build, once one is seen. */
let pendingId: string | null = null;

async function fetchDeployedId() {
    try {
        const response = await fetch(VERSION_URL, { cache: 'no-store' });
        if (!response.ok) return null;
        const { id } = (await response.json()) as { id?: unknown };
        return typeof id === 'string' ? id : null;
    } catch {
        return null; // offline, or a deploy still uploading
    }
}

function readReloadedFor() {
    try {
        return sessionStorage.getItem(RELOADED_FOR_KEY);
    } catch {
        return null;
    }
}

function rememberReloadedFor(id: string) {
    try {
        sessionStorage.setItem(RELOADED_FOR_KEY, id);
    } catch {
        // without storage a stale cached page could reload once per navigation, nothing worse
    }
}

async function checkForUpdate() {
    if (pendingId) return;
    const id = await fetchDeployedId();
    if (id && id !== __BUILD_ID__ && id !== readReloadedFor()) pendingId = id;
}

function checkIfVisible() {
    if (document.visibilityState === 'visible') void checkForUpdate();
}

/**
 * Picks up new deploys without a manual reload: an open tab keeps running the bundle it loaded,
 * so once a newer build is seen, the next move to another page is done as a full page load.
 * Waiting for a page change means nobody loses what they're looking at; filter or search
 * changes on the same page stay client-side.
 */
export function watchAppVersion(router: AnyRouter) {
    if (!import.meta.env.PROD) return;

    // also catches a stale index.html served from the browser cache on this very visit
    void checkForUpdate();
    setInterval(checkIfVisible, VERSION_CHECK_MS);
    document.addEventListener('visibilitychange', checkIfVisible);

    router.subscribe('onBeforeNavigate', ({ toLocation, pathChanged }) => {
        if (!pendingId || !pathChanged) return;
        rememberReloadedFor(pendingId);
        window.location.assign(toLocation.href);
    });
}
