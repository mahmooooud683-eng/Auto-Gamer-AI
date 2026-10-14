
import { requireNativeModule } from 'expo-modules-core';

export type InstalledGame = {
  name: string;
  packageName: string;
};

type AutoGamerModuleType = {
  getInstalledGames(): Promise<InstalledGame[]>;
  launchGame(packageName: string): Promise<{ success: boolean }>;
  openAccessibilitySettings(): void;
  isAccessibilityServiceConnected(): boolean;
  tap(x: number, y: number): Promise<boolean>;
  swipe(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    durationMs: number
  ): Promise<boolean>;
};

const AutoGamer =
  requireNativeModule<AutoGamerModuleType>('AutoGamer');

export default AutoGamer;
