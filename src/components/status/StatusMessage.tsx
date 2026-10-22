import type { ReactNode } from 'react';
import './Status.scss';

interface StatusMessageProps {
    title: string;
    children?: ReactNode;
    action?: ReactNode;
    tone?: 'error' | 'empty';
}

/** A boxed message where content would be: nothing found, or an error. */
export default function StatusMessage(props: StatusMessageProps) {
    const { title, children, action, tone = 'empty' } = props;

    return (
        <div className={`status status--${tone}`} role={tone === 'error' ? 'alert' : undefined}>
            <p className='status__title'>{title}</p>
            {children && <div className='status__text'>{children}</div>}
            {action && <div className='status__action'>{action}</div>}
        </div>
    );
}
