import type { SVGProps } from 'react';

/** Two opposite arrows (⇄), drawn centered in their box so they stay centered when rotated. */
export default function SwapIcon(props: SVGProps<SVGSVGElement>) {
    const { width = 16, height = 16, className = 'icon icon-swap', ...rest } = props;

    return (
        <svg
            className={className}
            xmlns='http://www.w3.org/2000/svg'
            width={width}
            height={height}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2.25}
            strokeLinecap='round'
            strokeLinejoin='round'
            {...rest}
        >
            <path d='M4 8h16M16 4l4 4-4 4' />
            <path d='M20 16H4M8 12l-4 4 4 4' />
        </svg>
    );
}
