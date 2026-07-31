export interface StandeePreferences {
  creatureSize: string;
  heightOverride: string;
  copies: string;
  pageMargin: string;
  itemGap: string;
  glueTab: string;
  labelSize: string;
  bottomSpace: string;
  showLabels: boolean;
  showLines: boolean;
}

const STORAGE_KEY = "ttrpg-tools:standeecrafter:preferences:v1";

export function loadPreferences(): Partial<StandeePreferences> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<StandeePreferences>;
  } catch {
    return {};
  }
}

export function savePreferences(preferences: StandeePreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // The tool remains usable when storage is unavailable or disabled.
  }
}
