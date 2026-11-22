import { formatLabel } from '@/utils/format';
import { heroPicture, towerPicture } from '@/utils/gamePictures';
import { formatHero } from '@/utils/hero';

interface LoadoutPicturesProps {
    /** NK's hero name ("Quincy", "Quincy_Cyber"): its picture first */
    hero?: string | undefined;
    /** NK's tower names ("BananaFarm") */
    towers: string[];
}

/** Our hero and tower pictures in a row: an extra to the names written next to them. */
export default function LoadoutPictures(props: LoadoutPicturesProps) {
    const { hero, towers } = props;

    const pictures = [
        ...(hero ? [{ key: hero, name: formatHero(hero), picture: heroPicture(hero) }] : []),
        ...towers.map((t) => ({ key: t, name: formatLabel(t), picture: towerPicture(t) })),
    ];
    return (
        <span className='loadout-pictures' aria-hidden='true'>
            {pictures.map((pick) =>
                pick.picture ? (
                    <img
                        key={pick.key}
                        className='loadout-pictures__picture'
                        src={pick.picture}
                        alt=''
                        title={pick.name}
                        loading='lazy'
                    />
                ) : (
                    <span key={pick.key} className='loadout-pictures__picture loadout-pictures__picture--empty' />
                ),
            )}
        </span>
    );
}
