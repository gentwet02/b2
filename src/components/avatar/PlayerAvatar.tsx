import { useState } from 'react';

/** URLs that already failed this session: don't retry them on every page/re-render. */
const broken = new Set<string>();

interface PlayerAvatarProps {
    src?: string | undefined;
    /** used for the fallback letter */
    name: string;
    /** base class, e.g. 'lb-player__avatar'; the fallback also gets `${className}--empty` */
    className: string;
    size: number;
    lazy?: boolean;
}

/** Avatar image that falls back to the player's initial when the URL is missing or dead. */
export default function PlayerAvatar({ src, name, className, size, lazy }: PlayerAvatarProps) {
    const [failed, setFailed] = useState<string | null>(null);

    if (src && failed !== src && !broken.has(src)) {
        return (
            <img
                className={className}
                src={src}
                alt=''
                width={size}
                height={size}
                loading={lazy ? 'lazy' : undefined}
                decoding='async'
                onError={() => {
                    broken.add(src);
                    setFailed(src);
                }}
            />
        );
    }

    return (
        <span className={`${className} ${className}--empty`} aria-hidden='true'>
            {name.charAt(0).toUpperCase()}
        </span>
    );
}
