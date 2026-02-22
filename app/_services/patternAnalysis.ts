import { ContainerItem } from '../_constants/Types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'pattern_insight_cache';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

interface PatternData {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  timeOfDayDistribution: Record<string, number>;
  recentCompletions: number; // Last 7 days
  actionDistribution: {
    completed: number;
    skipped: number;
    forgot: number;
    couldnt: number;
    notRelevant: number;
  };
}

interface CachedInsight {
  insight: string;
  timestamp: number;
}

/**
 * Analyze task patterns from user data
 */
export function analyzePatterns(items: ContainerItem[]): PatternData {
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

  let totalTasks = 0;
  let completedTasks = 0;
  let recentCompletions = 0;

  const timeOfDayDistribution: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    late: 0,
  };

  const actionDistribution = {
    completed: 0,
    skipped: 0,
    forgot: 0,
    couldnt: 0,
    notRelevant: 0,
  };

  items.forEach(item => {
    totalTasks++;

    // Count by container (time of day)
    if (item.container) {
      timeOfDayDistribution[item.container]++;
    }

    // Count completions
    if (item.completed) {
      completedTasks++;
      actionDistribution.completed++;

      // Count recent completions
      if (item.completedAt && item.completedAt > sevenDaysAgo) {
        recentCompletions++;
      }
    }

    // Count other actions
    if (item.skipped) actionDistribution.skipped++;
    if (item.forgot) actionDistribution.forgot++;
    if (item.couldnt) actionDistribution.couldnt++;
    if (item.notRelevant) actionDistribution.notRelevant++;
  });

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    totalTasks,
    completedTasks,
    completionRate,
    timeOfDayDistribution,
    recentCompletions,
    actionDistribution,
  };
}

/**
 * Generate a prompt for Gemini based on pattern data
 */
export function generatePrompt(data: PatternData): string {
  const { completionRate, timeOfDayDistribution, recentCompletions, actionDistribution } = data;

  // Find most active time of day
  const timeEntries = Object.entries(timeOfDayDistribution);
  const mostActiveTime = timeEntries.reduce((max, [time, count]) => 
    count > max.count ? { time, count } : max
  , { time: 'morning', count: 0 }).time;

  return `You are "The Field's Whisper" - a gentle, poetic observer in a nervous-system-aware task management app called PDA.OK.

Analyze these task patterns and offer ONE brief, atmospheric observation (1-2 sentences max):

- Completion rate: ${completionRate.toFixed(1)}%
- Recent completions (7 days): ${recentCompletions}
- Most active time: ${mostActiveTime}
- Actions: ${actionDistribution.completed} completed, ${actionDistribution.skipped} skipped, ${actionDistribution.forgot} forgot

Guidelines:
- Be poetic and embodied (mention breath, rhythm, flow, energy)
- Acknowledge patterns without judgment
- Use present tense, gentle language
- Reference time of day if relevant
- Keep it brief and atmospheric
- NO advice or suggestions, just observation
- Examples of tone: "The morning hours hold your momentum." / "Tasks complete themselves when evening arrives." / "Your rhythm finds its own pace."

Observation:`;
}

/**
 * Get cached insight if still valid
 */
export async function getCachedInsight(): Promise<string | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { insight, timestamp }: CachedInsight = JSON.parse(cached);
    const age = Date.now() - timestamp;

    if (age < CACHE_DURATION) {
      return insight;
    }

    return null;
  } catch (error) {
    console.error('Error reading cached insight:', error);
    return null;
  }
}

/**
 * Cache a new insight
 */
export async function cacheInsight(insight: string): Promise<void> {
  try {
    const cached: CachedInsight = {
      insight,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error('Error caching insight:', error);
  }
}
