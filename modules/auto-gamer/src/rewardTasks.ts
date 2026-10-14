
export type RewardPlatform = 'hola-go' | 'freecash' | 'other';

export type RewardTask = {
  id: string;
  platform: RewardPlatform;
  title: string;
  gameName: string;
  targetDescription: string;
  progress: number;
  target: number;
  status: 'pending' | 'in-progress' | 'completed';
  notes: string;
};

export function createRewardTask(
  input: Omit<RewardTask, 'progress' | 'status' | 'notes'>
): RewardTask {
  return {
    ...input,
    progress: 0,
    status: 'pending',
    notes: '',
  };
}

export function updateTaskProgress(
  task: RewardTask,
  progress: number,
  notes = task.notes
): RewardTask {
  const safeProgress = Math.max(
    0,
    Math.min(task.target, Math.floor(progress))
  );

  return {
    ...task,
    progress: safeProgress,
    notes,
    status:
      safeProgress >= task.target
        ? 'completed'
        : safeProgress > 0
          ? 'in-progress'
          : 'pending',
  };
}

export function getTaskProgressPercent(
  task: RewardTask
): number {
  if (task.target <= 0) return 0;

  return Math.round(
    (Math.min(task.progress, task.target) / task.target) * 100
  );
}

export function getPlatformLabel(
  platform: RewardPlatform
): string {
  switch (platform) {
    case 'hola-go':
      return 'Hola Go';
    case 'freecash':
      return 'Freecash';
    default:
      return 'منصة أخرى';
  }
}
