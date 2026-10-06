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

const mapMap: string[] = [
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
];

const resultMap: string[] = ['cancelled', 'draw', 'lobbyDC', 'lose', 'opponentLobbyDC', 'win'];

export function decodeTowers(dbTowers: string) {
    if (!dbTowers) {
        throw new Error('dbTowers code was null or undefined');
    }

    if (Number.isNaN(dbTowers)) {
        throw new Error('dbTowers code was not a number');
    }

    const dbTowersStr = dbTowers.toString().padStart(8, '0');

    const heroCode = dbTowersStr.substring(0, 2);
    const hero = heroMap[+heroCode];
    if (!hero) {
        throw new Error(`Invalid hero code: ${heroCode}`);
    }

    const towerCodes = dbTowers.substring(2);
    const towers = [];
    for (let i = 0; i + 1 <= dbTowers.length; i++) {
        const towerCode = towerCodes.substring(i, i + 2);
        const tower = towerMap[+towerCode];
        if (!tower) {
            throw new Error(`Invalid tower code: ${towerCode}`);
        } else {
            towers.push(tower);
        }
        i++;
    }

    return [hero, ...towers];
}

export function decodeMatchResult(dbmatchResult: number) {
    if (!dbmatchResult) {
        throw new Error('dbmatchResult code was null or undefined');
    }

    if (Number.isNaN(dbmatchResult)) {
        throw new Error('dbmatchResult code was not a number');
    }
    const dbmatchResultStr = dbmatchResult.toString();
    const playerWin = resultMap[+dbmatchResultStr.substring(0, 1)];
    if (!playerWin) {
        throw Error(`Invalid player win code: ${dbmatchResultStr.substring(0, 1)}`);
    }
    const map = mapMap[+dbmatchResultStr.substring(1, 3)];
    if (!map) {
        throw new Error(`Invalid map code: ${dbmatchResultStr.substring(1, 3)}`);
    }
    const endRound = +dbmatchResultStr.substring(3, 5);
    if (!endRound || !(endRound > 0 && endRound <= 50)) {
        throw Error(
            `Invalid end round code, must be between 1 and 50: ${dbmatchResultStr.substring(3, 5)}`
        );
    }
    const duration = +dbmatchResultStr.substring(5);
    return {
        map: map,
        playerWin: playerWin,
        endRound: endRound,
        duration: duration,
    };
}

export function decodeLeaderboardPlayer(player: LeaderboardPlayerEncoded): LeaderboardPlayer {
    return {
        id: player.i,
        ...(player.r && { realName: player.r }),
        name: player.n,
        currentlyInHoM: !!player.d.substring(0, 1),
        score: +player.d.substring(1),
    };
}
