
import { requireNativeModule } from 'expo-modules-core';

export type InstalledGame = {
  name: string;
  packageName: string;
};

export type ScreenElement = {
  text: string;
  description: string;
  className: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  clickable: boolean;
  enabled: boolean;
  scrollable: boolean;
  focused: boolean;
};

export type ScreenSnapshot = {
  success: boolean;
  message: string;
  packageName: string;
  elements: ScreenElement[];
  totalElements: number;
  truncated: boolean;
};

type AutoGamerModuleType = {
  getInstalledGames(): Promise<InstalledGame[]>;

  launchGame(
    packageName: string
  ): Promise<{ success: boolean }>;

  openAccessibilitySettings(): void;

  isAccessibilityServiceConnected(): boolean;

  readCurrentScreen(): ScreenSnapshot;

  findScreenText(query: string): ScreenElement[];

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
