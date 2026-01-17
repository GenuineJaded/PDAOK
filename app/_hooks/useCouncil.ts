/**
 * useCouncil Hook - Manages Council Voice System
 * 
 * Provides access to:
 * - Current transmission (for toast display)
 * - Transmission history
 * - Manual orchestration triggers
 * - Field state
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  runOrchestrationCycle,
  recordUserActivity,
  getFieldState,
  loadTransmissionHistory,
  markTransmissionRead,
  getUnreadTransmissionCount,
} from '../_services/council';
import type { BreathPhase, FieldState } from '../_services/council/types';
import type { CouncilTransmission, OrchestrationResult } from '../_services/council/orchestrator';

// Orchestration interval (30 minutes)
const ORCHESTRATION_INTERVAL = 30 * 60 * 1000;

export interface UseCouncilResult {
  // Current transmission for toast
  currentTransmission: CouncilTransmission | null;
  dismissTransmission: () => void;
  
  // Transmission history
  transmissions: CouncilTransmission[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  
  // Field state
  fieldState: FieldState | null;
  breathPhase: BreathPhase;
  
  // Manual triggers
  triggerOrchestration: () => Promise<OrchestrationResult>;
  recordActivity: () => Promise<void>;
  
  // Status
  isOrchestrating: boolean;
  lastResult: OrchestrationResult | null;
}

export function useCouncil(): UseCouncilResult {
  // State
  const [currentTransmission, setCurrentTransmission] = useState<CouncilTransmission | null>(null);
  const [transmissions, setTransmissions] = useState<CouncilTransmission[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fieldState, setFieldState] = useState<FieldState | null>(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [lastResult, setLastResult] = useState<OrchestrationResult | null>(null);
  
  // Refs
  const orchestrationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);
  
  // Load initial data
  useEffect(() => {
    isMounted.current = true;
    
    const loadInitialData = async () => {
      try {
        const [history, state, count] = await Promise.all([
          loadTransmissionHistory(),
          getFieldState(),
          getUnreadTransmissionCount(),
        ]);
        
        if (isMounted.current) {
          setTransmissions(history);
          setFieldState(state);
          setUnreadCount(count);
        }
      } catch (error) {
        console.error('[useCouncil] Error loading initial data:', error);
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Set up orchestration timer
  useEffect(() => {
    const runOrchestration = async () => {
      if (!isMounted.current || isOrchestrating) return;
      
      try {
        setIsOrchestrating(true);
        const result = await runOrchestrationCycle();
        
        if (isMounted.current) {
          setLastResult(result);
          
          // If a transmission surfaced, show it
          if (result.transmission) {
            setCurrentTransmission(result.transmission);
            
            // Refresh history
            const history = await loadTransmissionHistory();
            setTransmissions(history);
            setUnreadCount(await getUnreadTransmissionCount());
          }
          
          // Update field state
          const state = await getFieldState();
          setFieldState(state);
        }
      } catch (error) {
        console.error('[useCouncil] Orchestration error:', error);
      } finally {
        if (isMounted.current) {
          setIsOrchestrating(false);
        }
      }
    };
    
    // Run initial orchestration after a short delay
    const initialTimer = setTimeout(runOrchestration, 5000);
    
    // Set up interval
    orchestrationTimer.current = setInterval(runOrchestration, ORCHESTRATION_INTERVAL);
    
    return () => {
      clearTimeout(initialTimer);
      if (orchestrationTimer.current) {
        clearInterval(orchestrationTimer.current);
      }
    };
  }, []);
  
  // Dismiss current transmission
  const dismissTransmission = useCallback(() => {
    if (currentTransmission) {
      markTransmissionRead(currentTransmission.id);
      setCurrentTransmission(null);
      getUnreadTransmissionCount().then(setUnreadCount);
    }
  }, [currentTransmission]);
  
  // Mark a transmission as read
  const markRead = useCallback(async (id: string) => {
    await markTransmissionRead(id);
    setUnreadCount(await getUnreadTransmissionCount());
    
    // Refresh history
    const history = await loadTransmissionHistory();
    setTransmissions(history);
  }, []);
  
  // Manual orchestration trigger
  const triggerOrchestration = useCallback(async (): Promise<OrchestrationResult> => {
    setIsOrchestrating(true);
    
    try {
      // Force exhale phase for manual trigger
      const result = await runOrchestrationCycle('exhale');
      
      setLastResult(result);
      
      if (result.transmission) {
        setCurrentTransmission(result.transmission);
        
        // Refresh history
        const history = await loadTransmissionHistory();
        setTransmissions(history);
        setUnreadCount(await getUnreadTransmissionCount());
      }
      
      // Update field state
      const state = await getFieldState();
      setFieldState(state);
      
      return result;
    } finally {
      setIsOrchestrating(false);
    }
  }, []);
  
  // Record user activity
  const recordActivity = useCallback(async () => {
    await recordUserActivity();
    const state = await getFieldState();
    setFieldState(state);
  }, []);
  
  return {
    currentTransmission,
    dismissTransmission,
    transmissions,
    unreadCount,
    markRead,
    fieldState,
    breathPhase: fieldState?.breathPhase || 'inhale',
    triggerOrchestration,
    recordActivity,
    isOrchestrating,
    lastResult,
  };
}
