
import { requireNativeModule } from 'expo-modules-core';

export type InstalledGame = {
  name: string;
  packageName: string;
};

type AutoGamerModuleType = {
  getInstalledGames(): Promise<InstalledGame[]>;
  launchGame(packageName: string): Promise<{ success: boolean }>;
};

const AutoGamerModule =
  requireNativeModule<AutoGamerModuleType>('AutoGamer');

export default AutoGamerModule;
