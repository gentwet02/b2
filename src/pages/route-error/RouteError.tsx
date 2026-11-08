import { useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import Page from '@/components/page/Page';
import ErrorState from '@/components/status/ErrorState';

/**
 * Any page that throws while rendering or loading: shown in its place, the header and footer
 * stay. Requests that fail are handled by each page; this is for what nobody planned for.
 */
export default function RouteError(props: ErrorComponentProps) {
    const { error, reset } = props;
    const router = useRouter();

    function retry() {
        reset();
        void router.invalidate();
    }

    return (
        <Page>
            <ErrorState title='This page hit a snag' error={error instanceof Error ? error : null} onRetry={retry} />
        </Page>
    );
}
