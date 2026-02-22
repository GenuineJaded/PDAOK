import { ContainerItem } from '../_constants/Types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateInsight } from './geminiService';

const SYNTHESIS_CACHE_KEY = 'daily_synthesis_cache';
const SYNTHESIS_HISTORY_KEY = 'daily_synthesis_history';

export interface DailySynthesis {
  date: string; // YYYY-MM-DD
  timestamp: number;
  synthesis: string;
  stats: {
    completed: number;
    skipped: number;
    forgot: number;
    couldnt: number;
    notRelevant: number;
    total: number;
  };
}

interface DayData {
  completed: number;
  skipped: number;
  forgot: number;
  couldnt: number;
  notRelevant: number;
  total: number;
  timeOfDayBreakdown: Record<string, { completed: number; total: number }>;
}

interface PatternData {
  repeatedSkips: string[]; // Task names skipped multiple days
  repeatedCouldnts: string[]; // Task names marked "couldn't" multiple days
  strugglingTimeBlock: string | null; // Time block with lowest completion rate
  flowingTimeBlock: string | null; // Time block with highest completion rate
}

/**
 * Get today's date string (YYYY-MM-DD)
 */
function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Check if synthesis already exists for today
 */
export async function getTodaySynthesis(): Promise<DailySynthesis | null> {
  try {
    const cached = await AsyncStorage.getItem(SYNTHESIS_CACHE_KEY);
    if (!cached) return null;

    const synthesis: DailySynthesis = JSON.parse(cached);
    if (synthesis.date === getTodayString()) {
      return synthesis;
    }

    return null;
  } catch (error) {
    console.error('Error reading cached synthesis:', error);
    return null;
  }
}

/**
 * Analyze today's task data
 */
function analyzeTodayData(items: ContainerItem[]): DayData {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const data: DayData = {
    completed: 0,
    skipped: 0,
    forgot: 0,
    couldnt: 0,
    notRelevant: 0,
    total: 0,
    timeOfDayBreakdown: {
      morning: { completed: 0, total: 0 },
      afternoon: { completed: 0, total: 0 },
      evening: { completed: 0, total: 0 },
      late: { completed: 0, total: 0 },
    },
  };

  items.forEach(item => {
    // Only count tasks created today or earlier
    if (item.createdAt && new Date(item.createdAt).getTime() >= todayTimestamp) {
      data.total++;

      // Count by action
      if (item.completed) data.completed++;
      if (item.skipped) data.skipped++;
      if (item.forgot) data.forgot++;
      if (item.couldnt) data.couldnt++;
      if (item.notRelevant) data.notRelevant++;

      // Count by time of day
      if (item.container) {
        const timeBlock = data.timeOfDayBreakdown[item.container];
        if (timeBlock) {
          timeBlock.total++;
          if (item.completed) timeBlock.completed++;
        }
      }
    }
  });

  return data;
}

/**
 * Detect patterns over last 3-7 days
 */
function detectPatterns(items: ContainerItem[]): PatternData {
  const now = Date.now();
  const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

  const recentItems = items.filter(item => 
    item.createdAt && new Date(item.createdAt).getTime() >= sevenDaysAgo
  );

  // Track repeated skips/couldn'ts
  const skipCounts: Record<string, number> = {};
  const couldntCounts: Record<string, number> = {};
  const timeBlockStats: Record<string, { completed: number; total: number }> = {
    morning: { completed: 0, total: 0 },
    afternoon: { completed: 0, total: 0 },
    evening: { completed: 0, total: 0 },
    late: { completed: 0, total: 0 },
  };

  recentItems.forEach(item => {
    if (item.skipped) {
      skipCounts[item.text || item.title] = (skipCounts[item.text || item.title] || 0) + 1;
    }
    if (item.couldnt) {
      couldntCounts[item.text || item.title] = (couldntCounts[item.text || item.title] || 0) + 1;
    }

    // Time block stats
    if (item.container) {
      const stats = timeBlockStats[item.container];
      if (stats) {
        stats.total++;
        if (item.completed) stats.completed++;
      }
    }
  });

  // Find tasks skipped/couldn't 3+ times
  const repeatedSkips = Object.keys(skipCounts).filter(task => skipCounts[task] >= 3);
  const repeatedCouldnts = Object.keys(couldntCounts).filter(task => couldntCounts[task] >= 3);

  // Find struggling/flowing time blocks
  let lowestRate = 1;
  let highestRate = 0;
  let strugglingTimeBlock: string | null = null;
  let flowingTimeBlock: string | null = null;

  Object.entries(timeBlockStats).forEach(([block, stats]) => {
    if (stats.total >= 3) { // Only consider blocks with enough data
      const rate = stats.completed / stats.total;
      if (rate < lowestRate) {
        lowestRate = rate;
        strugglingTimeBlock = block;
      }
      if (rate > highestRate) {
        highestRate = rate;
        flowingTimeBlock = block;
      }
    }
  });

  return {
    repeatedSkips,
    repeatedCouldnts,
    strugglingTimeBlock: lowestRate < 0.4 ? strugglingTimeBlock : null, // Only flag if < 40%
    flowingTimeBlock: highestRate > 0.7 ? flowingTimeBlock : null, // Only flag if > 70%
  };
}

/**
 * Generate prompt for daily synthesis
 */
function generateSynthesisPrompt(dayData: DayData, patterns: PatternData): string {
  const { completed, skipped, forgot, couldnt, notRelevant, total, timeOfDayBreakdown } = dayData;

  // Find most productive time block
  let mostProductiveBlock = 'morning';
  let mostProductiveCount = timeOfDayBreakdown.morning.completed;
  Object.entries(timeOfDayBreakdown).forEach(([block, stats]) => {
    if (stats.completed > mostProductiveCount) {
      mostProductiveBlock = block;
      mostProductiveCount = stats.completed;
    }
  });

  let prompt = `You are generating a Daily Synthesis (Evening Reflection) for PDA.OK, a nervous-system-aware task management app.

Today's Data:
- Total tasks: ${total}
- Completed: ${completed}
- Skipped: ${skipped}
- Forgot: ${forgot}
- Couldn't: ${couldnt}
- Not relevant: ${notRelevant}
- Most productive time: ${mostProductiveBlock} (${mostProductiveCount} completions)

`;

  // Add pattern information
  if (patterns.repeatedSkips.length > 0) {
    prompt += `Pattern Notice: These tasks have been skipped 3+ times recently: ${patterns.repeatedSkips.join(', ')}\n`;
  }
  if (patterns.repeatedCouldnts.length > 0) {
    prompt += `Pattern Notice: These tasks marked "couldn't" 3+ times: ${patterns.repeatedCouldnts.join(', ')}\n`;
  }
  if (patterns.strugglingTimeBlock) {
    prompt += `Pattern Notice: ${patterns.strugglingTimeBlock} time block has low completion rate\n`;
  }
  if (patterns.flowingTimeBlock) {
    prompt += `Pattern Notice: ${patterns.flowingTimeBlock} time block has high completion rate\n`;
  }

  prompt += `
Generate a Daily Synthesis with these sections:

1. **Opening Witness** (2-3 sentences)
   - Poetic summary of the day's rhythm
   - Acknowledge both completion and incompletion without judgment
   - Use embodied, atmospheric language

2. **Pattern Notice** (if patterns exist, otherwise skip)
   - Name the pattern compassionately
   - Offer a gentle corrective suggestion (not a command)
   - Frame as invitation: "The container may need..." or "Consider..."
   - Examples:
     * "Afternoon tasks have struggled for three days. Consider smaller anchors, or shifting to evening when rhythm steadies."
     * "Morning momentum is strong. The field knows when to move."

3. **Closing** (1 sentence)
   - Gentle closure
   - "The day completes itself. Rest is part of the weave."

Tone:
- Poetic, embodied, nervous-system-aware
- No judgment about incompletion
- Corrective suggestions as invitations, not commands
- Present tense, gentle language
- Keep total response under 150 words

Daily Synthesis:`;

  return prompt;
}

/**
 * Generate daily synthesis
 */
export async function generateDailySynthesis(items: ContainerItem[]): Promise<DailySynthesis> {
  // Check if already generated today
  const existing = await getTodaySynthesis();
  if (existing) return existing;

  // Analyze data
  const dayData = analyzeTodayData(items);
  const patterns = detectPatterns(items);

  // Generate synthesis
  const prompt = generateSynthesisPrompt(dayData, patterns);
  const synthesis = await generateInsight(prompt);

  // Create synthesis object
  const dailySynthesis: DailySynthesis = {
    date: getTodayString(),
    timestamp: Date.now(),
    synthesis,
    stats: {
      completed: dayData.completed,
      skipped: dayData.skipped,
      forgot: dayData.forgot,
      couldnt: dayData.couldnt,
      notRelevant: dayData.notRelevant,
      total: dayData.total,
    },
  };

  // Cache for today
  await AsyncStorage.setItem(SYNTHESIS_CACHE_KEY, JSON.stringify(dailySynthesis));

  // Add to history
  await addToHistory(dailySynthesis);

  return dailySynthesis;
}

/**
 * Add synthesis to history
 */
async function addToHistory(synthesis: DailySynthesis): Promise<void> {
  try {
    const historyJson = await AsyncStorage.getItem(SYNTHESIS_HISTORY_KEY);
    const history: DailySynthesis[] = historyJson ? JSON.parse(historyJson) : [];

    // Add new synthesis
    history.unshift(synthesis);

    // Keep last 30 days
    const trimmed = history.slice(0, 30);

    await AsyncStorage.setItem(SYNTHESIS_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error adding to synthesis history:', error);
  }
}

/**
 * Get synthesis history
 */
export async function getSynthesisHistory(): Promise<DailySynthesis[]> {
  try {
    const historyJson = await AsyncStorage.getItem(SYNTHESIS_HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error reading synthesis history:', error);
    return [];
  }
}
