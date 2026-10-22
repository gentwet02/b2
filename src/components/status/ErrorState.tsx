import StatusMessage from './StatusMessage';

interface ErrorStateProps {
    error: Error | null;
    title?: string;
    onRetry?: () => void;
}

/** A failed request: the server's message, and a retry button. */
export default function ErrorState(props: ErrorStateProps) {
    const { error, title = 'Something went wrong', onRetry } = props;

    return (
        <StatusMessage
            tone='error'
            title={title}
            action={
                onRetry && (
                    <button type='button' className='button' onClick={onRetry}>
                        Try again
                    </button>
                )
            }
        >
            {error?.message ?? 'Unknown error'}
        </StatusMessage>
    );
}
