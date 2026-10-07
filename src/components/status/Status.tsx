import type { ReactNode } from 'react';

interface LoadingProps {
    label?: string;
}

/** A bloon bobbing on its string while data loads. */
export function Loading({ label = 'Loading…' }: LoadingProps) {
    return (
        <div className='status status--loading' role='status' aria-live='polite'>
            <svg className='status__bloon' viewBox='0 0 40 60' aria-hidden='true'>
                <ellipse cx='20' cy='20' rx='16' ry='19' />
                <path d='M17 38 L20 43 L23 38 Z' />
                <path className='status__string' d='M20 43 C 16 50, 24 53, 20 60' />
            </svg>
            <span className='status__label'>{label}</span>
        </div>
    );
}

interface MessageProps {
    title: string;
    children?: ReactNode;
    action?: ReactNode;
    tone?: 'error' | 'empty';
}

export function StatusMessage({ title, children, action, tone = 'empty' }: MessageProps) {
    return (
        <div className={`status status--${tone}`} role={tone === 'error' ? 'alert' : undefined}>
            <p className='status__title'>{title}</p>
            {children && <div className='status__text'>{children}</div>}
            {action && <div className='status__action'>{action}</div>}
        </div>
    );
}

interface ErrorProps {
    error: Error | null;
    title?: string;
    onRetry?: () => void;
}

export function ErrorState({ error, title = 'Something went wrong', onRetry }: ErrorProps) {
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
