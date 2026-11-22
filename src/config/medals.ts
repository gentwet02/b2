/**
 * The Hall of Masters' season medals: NK's badge name (the server names a rank's medal:
 * btdb2server `config/leaderboard.ts`, HOM_MEDAL_*) → our picture of it, named like NK's file
 * (assets/images/medals).
 */
export const HOM_MEDAL_FILES: Record<string, string> = {
    Arena_Master_1st: 'season_medal_hom_1st',
    Arena_Master_2nd: 'season_medal_hom_2nd',
    Arena_Master_3rd: 'season_medal_hom_3rd',
    Arena_Master_Top10: 'season_medal_hom_top10',
    Arena_Master_Top25: 'season_medal_hom_top25place',
    Arena_Master_Top50: 'season_medal_hom_top50place',
    Arena_Master_Top100: 'season_medal_hom_top100',
    Arena_Master_Top10Percent: 'season_medal_hom_top10perc',
    Arena_Master_Top25Percent: 'season_medal_hom_top25',
    Arena_Master_Top50Percent: 'season_medal_hom_top50',
    Arena_Master_Top75Percent: 'season_medal_hom_top75',
    Arena_Master: 'season_medal_hom',
};
