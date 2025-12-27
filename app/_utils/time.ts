import { ContainerId } from '../_constants/Types';

/**
 * Get the current time container based on hour of day
 */
export function getCurrentContainer(): ContainerId {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon';
  } else if (hour >= 17 && hour < 22) {
    return 'evening';
  } else {
    return 'late';
  }
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format time as HH:MM AM/PM
 */
export function formatTime(date: Date = new Date()): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Format date as "Thursday, October 23"
 */
export function formatLongDate(date: Date = new Date()): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();
  
  return `${dayName}, ${monthName} ${dayNum}`;
}

/**
 * Check if a completion is for today
 */
export function isToday(dateString: string): boolean {
  return dateString === formatDate();
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

