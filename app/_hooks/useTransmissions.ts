/**
 * useTransmissions Hook
 * Manages autonomous transmissions in the app
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  loadTransmissions, 
  markTransmissionRead,
  getUnreadCount,
  checkAndGenerateTransmissions,
  forceCheckTransmissions,
  initializeTransmissionScheduler,
  clearAllTransmissions
} from '../_services/transmissionScheduler';
import { Transmission, TransmissionContext, getCurrentTimeOfDay } from '../_services/transmissionGenerator';
import { useApp } from '../_context/AppContext';

interface StoredTransmission extends Transmission {
  read: boolean;
}

export function useTransmissions() {
  const context = useApp();
  const [transmissions, setTransmissions] = useState<StoredTransmission[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Build transmission context from app state
  const buildContext = useCallback((): TransmissionContext => {
    // Build anchor data with completions
    const anchors = (context.items || []).map(item => ({
      id: item.id,
      name: item.title,
      container: item.container,
      completions: (context.completions || [])
        .filter(c => c.itemId === item.id)
        .map(c => ({
          timestamp: c.timestamp,
          timeContainer: item.container,
        })),
    }));

    return {
      conversations: context.conversations || [],
      patterns: context.patterns || [],
      journalEntries: [...(context.journalEntries || []), ...(context.substanceJournalEntries || [])],
      allies: context.allies || [],
      archetypes: context.archetypes || [],
      anchors,
      currentTimeOfDay: getCurrentTimeOfDay(),
    };
  }, [context]);

  // Load transmissions on mount
  useEffect(() => {
    loadData();
  }, []);

  // Initialize scheduler on mount
  useEffect(() => {
    if (!context.loading) {
      initializeTransmissionScheduler(buildContext);
    }
  }, [context.loading, buildContext]);

  // Refresh transmissions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 60000); // Check every minute for new transmissions

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await loadTransmissions();
    setTransmissions(data);
    const count = await getUnreadCount();
    setUnreadCount(count);
    setLoading(false);
  };

  const markRead = async (transmissionId: string) => {
    await markTransmissionRead(transmissionId);
    await loadData();
  };

  const forceCheck = async () => {
    const transmissionContext = buildContext();
    await forceCheckTransmissions(transmissionContext);
    await loadData();
  };

  const clearAll = async () => {
    await clearAllTransmissions();
    await loadData();
  };

  return {
    transmissions,
    unreadCount,
    loading,
    markRead,
    forceCheck,
    clearAll,
    refresh: loadData,
  };
}
