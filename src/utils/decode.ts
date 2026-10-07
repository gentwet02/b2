import type { LeaderboardPlayer, LeaderboardPlayerEncoded } from '@/types/leaderboard';

const towerMap: string[] = [
    'Alchemist',
    'BananaFarm',
    'BombShooter',
    'BoomerangMonkey',
    'DartlingGunner',
    'DartMonkey',
    'Druid',
    'EngineerMonkey',
    'GlueGunner',
    'HeliPilot',
    'IceMonkey',
    'MonkeyAce',
    'MonkeyBuccaneer',
    'MonkeySub',
    'MonkeyVillage',
    'MortarMonkey',
    'NinjaMonkey',
    'SniperMonkey',
    'SpikeFactory',
    'SuperMonkey',
    'TackShooter',
    'WizardMonkey',
];

const heroMap: string[] = [
    'Agent_Jericho',
    'Benjamin',
    'Benjamin_DJ',
    'Churchill',
    'Churchill_Sentai',
    'DartMonkey',
    'Ezili',
    'Ezili_SmudgeCat',
    'Gwendolin',
    'Gwendolin_Science',
    'Highwayman_Jericho',
    'Obyn',
    'Obyn_Ocean',
    'PatFusty',
    'PatFusty_Snowman',
    'Quincy',
    'Quincy_Cyber',
    'StrikerJones',
    'StrikerJones_Biker',
    'Jericho_StarCaptain',
    'Jericho',
    'Jericho_Highwayman',
    'Adora',
    'Adora_Fateweaver',
    'Etienne',
    'Bonnie',
    'Etienne_Bee',
];

// was missing 'club_jammin' at index 0 (every map decoded one off) and the last 7 maps
const mapMap: string[] = [
    'club_jammin',
    'thin_ice',
    'neo_highway',
    'star',
    'sands_of_time',
    'ports',
    'oasis',
    'mayan_map_01',
    'koru',
    'inflection',
    'in_the_wall',
    'glade',
    'garden',
    'docks',
    'dino_graveyard',
    'cobra_command',
    'castle_ruins',
    'building_site_scene',
    'bloontonium_mines',
    'bloon_bot_factory',
    'basalt_columns',
    'banana_depot_scene',
    'off_tide',
    'pirate_cove',
    'precious_space',
    'sun_palace',
    'salmon_pool',
    'island_base',
    'times_up',
    'bloonstone_quarry',
    'up_on_the_roof',
    'splashdown',
    'building_site',
    'le_ruins',
    'mayan',
    'offtide',
    'banana_depot',
    'salmon_ladder',
    'skull_party',
    'bot_factory',
    'lava_canyon',
    'cobra_command_reversed',
    'glade_reversed',
    'oasis_reversed',
    'inflection_reversed',
    'offtide_reversed',
    'park',
];

const resultMap: string[] = ['cancelled', 'draw', 'lobbyDC', 'lose', 'opponentLobbyDC', 'win'];

/** `t` of a stored match player: hero(2) + 3 × tower(2) digits, leading zeros lost by parseInt. */
export function decodeTowers(dbTowers: number | string) {
    const code = String(dbTowers);
    if (!/^\d+$/.test(code)) throw new Error(`Invalid towers code: ${code}`);

    const digits = code.padStart(8, '0');
    const hero = heroMap[+digits.slice(0, 2)];
    if (!hero) throw new Error(`Invalid hero code: ${digits.slice(0, 2)}`);

    const towers = [2, 4, 6].map((start) => {
        const towerCode = digits.slice(start, start + 2);
        const tower = towerMap[+towerCode];
        if (!tower) throw new Error(`Invalid tower code: ${towerCode}`);
        return tower;
    });

    return [hero, ...towers];
}

/** `d` of a stored match: result(1) + map(2) + endRound(2) + duration(4+). */
export function decodeMatchResult(dbMatchResult: number | string) {
    const code = String(dbMatchResult);
    if (!/^\d+$/.test(code)) throw new Error(`Invalid match code: ${code}`);

    // result 0 ('cancelled') loses its leading digit through parseInt
    const digits = code.padStart(9, '0');
    const playerWin = digits[0] ? resultMap[+digits[0]] : 'cancelled';
    if (!playerWin) throw new Error(`Invalid result code: ${digits[0]}`);

    const map = mapMap[+digits.slice(1, 3)];
    if (!map) throw new Error(`Invalid map code: ${digits.slice(1, 3)}`);

    const endRound = +digits.slice(3, 5);
    if (endRound < 1 || endRound > 50) {
        throw new Error(`Invalid end round, must be between 1 and 50: ${digits.slice(3, 5)}`);
    }

    return { map, playerWin, endRound, duration: +digits.slice(5) };
}

export function decodeLeaderboardPlayer(player: LeaderboardPlayerEncoded): LeaderboardPlayer {
    return {
        id: player.i,
        ...(player.r && { realName: player.r }),
        name: player.n,
        // was `!!substring(0, 1)`: "0" is a truthy string, so everybody was in HoM
        currentlyInHoM: player.d[0] === '1',
        score: Number(player.d.slice(1)),
    };
}
