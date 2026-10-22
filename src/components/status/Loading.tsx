import './Status.scss';

interface LoadingProps {
    label?: string;
}

/** A bloon bobbing on its string while data loads. */
export default function Loading(props: LoadingProps) {
    const { label = 'Loading…' } = props;

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
