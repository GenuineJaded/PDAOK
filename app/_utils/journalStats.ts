/**
 * Journal Statistics and Date Grouping Utilities
 */

export interface DateGroup<T> {
  date: string; // "Today", "Yesterday", "Dec 28", etc.
  rawDate: string; // YYYY-MM-DD for sorting
  entries: T[];
}

export interface JournalStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byDay: Record<string, number>; // YYYY-MM-DD -> count
}

/**
 * Format a date for display in groups
 */
export function formatGroupDate(date: Date): { display: string; raw: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const entryDate = new Date(date);
  const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
  
  const raw = `${entryDay.getFullYear()}-${String(entryDay.getMonth() + 1).padStart(2, '0')}-${String(entryDay.getDate()).padStart(2, '0')}`;
  
  if (entryDay.getTime() === today.getTime()) {
    return { display: 'Today', raw };
  } else if (entryDay.getTime() === yesterday.getTime()) {
    return { display: 'Yesterday', raw };
  } else if (entryDay.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
    // Within last week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return { display: days[entryDay.getDay()], raw };
  } else {
    // Older entries
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { display: `${months[entryDay.getMonth()]} ${entryDay.getDate()}`, raw };
  }
}

/**
 * Group entries by date
 */
export function groupEntriesByDate<T extends { date: string; timestamp: number }>(
  entries: T[]
): DateGroup<T>[] {
  const groups: Record<string, DateGroup<T>> = {};
  
  // Sort entries by timestamp (newest first)
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    const { display, raw } = formatGroupDate(entryDate);
    
    if (!groups[raw]) {
      groups[raw] = {
        date: display,
        rawDate: raw,
        entries: [],
      };
    }
    
    groups[raw].entries.push(entry);
  }
  
  // Convert to array and sort by date (newest first)
  return Object.values(groups).sort((a, b) => b.rawDate.localeCompare(a.rawDate));
}

/**
 * Calculate statistics for journal entries
 */
export function calculateJournalStats<T extends { date: string; timestamp: number }>(
  entries: T[]
): JournalStats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const stats: JournalStats = {
    total: entries.length,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    byDay: {},
  };
  
  for (const entry of entries) {
    const entryDate = new Date(entry.date);
    const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
    const dayKey = `${entryDay.getFullYear()}-${String(entryDay.getMonth() + 1).padStart(2, '0')}-${String(entryDay.getDate()).padStart(2, '0')}`;
    
    // Count by day
    stats.byDay[dayKey] = (stats.byDay[dayKey] || 0) + 1;
    
    // Count today
    if (entryDay.getTime() === today.getTime()) {
      stats.today++;
    }
    
    // Count this week
    if (entryDate.getTime() >= weekAgo.getTime()) {
      stats.thisWeek++;
    }
    
    // Count this month
    if (entryDate.getTime() >= monthAgo.getTime()) {
      stats.thisMonth++;
    }
  }
  
  return stats;
}

/**
 * Get a summary string for journal stats
 */
export function getStatsSummary(stats: JournalStats): string {
  const parts: string[] = [];
  
  if (stats.today > 0) {
    parts.push(`${stats.today} today`);
  }
  
  if (stats.thisWeek > 0 && stats.thisWeek !== stats.today) {
    parts.push(`${stats.thisWeek} this week`);
  }
  
  if (parts.length === 0 && stats.total > 0) {
    parts.push(`${stats.total} total`);
  }
  
  return parts.join(' • ');
}
