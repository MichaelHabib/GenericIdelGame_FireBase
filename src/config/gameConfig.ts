
export const INITIAL_POINTS = 0;
export const POINTS_PER_CLICK = 1;

export const ITEM_DROP_CHANCE_PER_SECOND = 0.10; 
export const ITEM_DROP_CHANCE_PER_CLICK = 0.02;  

export const ARTIFICE_DROP_CHANCE_PER_SECOND = 0.02;
export const ARTIFICE_DROP_CHANCE_PER_CLICK = 0.005;

export const SAVE_GAME_KEY = "pointClickerProSaveData_v2"; 
export const AUTOSAVE_INTERVAL = 30000; 

export const MAX_OFFLINE_EARNING_DURATION_SECONDS = 2 * 60 * 60; 

// Prestige System Config
export const INITIAL_LEGACY_TOKENS = 0;
export const PRESTIGE_POINTS_REQUIREMENT = 1_000_000_000_000; // 1 Trillion points to prestige
export const LEGACY_TOKEN_FORMULA = (points: number): number => {
  // Example: 1 LT for every 1B points, but scaled - sqrt makes it harder to get many tokens initially
  // Adjust this formula to balance prestige progression
  if (points < PRESTIGE_POINTS_REQUIREMENT) return 0;
  return Math.floor(Math.sqrt(points / 1_000_000_000)); 
};
export const PRESTIGE_REQUIREMENT_INCREASE_FACTOR = 2; // Multiplies points needed for next prestige

