import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, ContainerItem, Ally, Moment, Completion, ContainerId, Pattern, FoodEntry, MovementEntry, Archetype, DailyCheckItem, ActiveTimer, DailyRitualState } from '../_constants/Types';
import { JournalEntry } from '../_constants/Types'; // Keep JournalEntry for backward compatibility if needed, but Moment is the new primary type
import { DEFAULT_ALLIES, DEFAULT_GROUNDING_ITEMS, DEFAULT_ARCHETYPES } from '../_constants/DefaultData';
import { ThemeName, DEFAULT_THEME } from '../_constants/Themes';
import { saveAppState, loadAppState } from '../_utils/storage';
import { formatDate, generateId, getCurrentContainer } from '../_utils/time';
import { needsMigration, runMigration } from '../_utils/migration';

interface AppContextType extends AppState {

  addItem: (item: Omit<ContainerItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, item: Partial<ContainerItem>) => void;
  toggleCompletion: (itemId: string) => void;
  isCompleted: (itemId: string) => boolean;
  addAlly: (ally: Omit<Ally, 'id'>) => void;
  updateAlly: (ally: Ally) => void;
  removeAlly: (id: string) => void;
  logAllyUse: (ally: Ally, details?: Partial<Moment>) => void;
  addMoment: (moment: Omit<Moment, 'id' | 'timestamp' | 'date'>) => void;
  addSubstanceMoment: (moment: Omit<Moment, 'id' | 'timestamp' | 'date'>) => void;
  addPattern: (pattern: Omit<Pattern, 'id' | 'timestamp' | 'date'>) => void;
  removePattern: (id: string) => void;
  addConversation: (conversation: Omit<import('../_constants/Types').Conversation, 'id' | 'timestamp' | 'date'>) => void;
  addFieldWhisper: (whisper: Omit<import('../_constants/Types').FieldWhisper, 'id' | 'timestamp' | 'date'>) => void;
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'timestamp' | 'date'>) => void;
  removeFoodEntry: (id: string) => void;
  updateFoodEntry: (id: string, entry: Partial<FoodEntry>) => void;
  addMovementEntry: (entry: Omit<MovementEntry, 'id' | 'timestamp' | 'date'>) => void;
  removeMovementEntry: (id: string) => void;
  updateMovementEntry: (id: string, entry: Partial<MovementEntry>) => void;
  addDreamseed: (word: string) => void;
  addArchetype: (archetype: Partial<Omit<import('../_constants/Types').Archetype, 'id'>>) => void;
  updateArchetype: (archetype: import('../_constants/Types').Archetype) => void;
  removeArchetype: (id: string) => void;
  setActiveContainer: (container: ContainerId) => void;
  activeArchetypeId: string | null;
  setActiveArchetypeId: (id: string | null) => void;
  selectedTheme: ThemeName;
  setSelectedTheme: (theme: ThemeName) => void;
  loading: boolean;
  removeJournalEntry: (id: string) => void;
  removeSubstanceJournalEntry: (id: string) => void;
  updateSubstanceJournalEntry: (id: string, entry: Partial<Moment>) => void;
  // Timer & Daily Rituals
  dailyChecklist: DailyCheckItem[];
  activeTimers: ActiveTimer[];
  toggleDailyCheckItem: (id: string) => void;
  startTimer: (minutes: number, label: string) => Promise<void>;
  cancelTimer: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ContainerItem[]>(DEFAULT_GROUNDING_ITEMS);
  const [allies, setAllies] = useState<Ally[]>(DEFAULT_ALLIES);
  const [journalEntries, setJournalEntries] = useState<Moment[]>([]);
  const [substanceJournalEntries, setSubstanceJournalEntries] = useState<Moment[]>([]);
  
  const removeJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);
  
  const removeSubstanceJournalEntry = useCallback((id: string) => {
    setSubstanceJournalEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);
  
  const updateSubstanceJournalEntry = useCallback((id: string, updates: Partial<Moment>) => {
    setSubstanceJournalEntries(prev => prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry));
  }, []);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [movementEntries, setMovementEntries] = useState<MovementEntry[]>([]);
  const [dreamseeds, setDreamseeds] = useState<import('../_constants/Types').Dreamseed[]>([]);
  const [conversations, setConversations] = useState<import('../_constants/Types').Conversation[]>([]);
  const [fieldWhispers, setFieldWhispers] = useState<import('../_constants/Types').FieldWhisper[]>([]);
  const [archetypes, setArchetypes] = useState<Archetype[]>(DEFAULT_ARCHETYPES);
  const [activeContainer, setActiveContainer] = useState<ContainerId>(getCurrentContainer());
  const [activeArchetypeId, setActiveArchetypeId] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(DEFAULT_THEME);

  // Daily Rituals & Timers
  const DEFAULT_DAILY_CHECKLIST: DailyCheckItem[] = [
    { id: 'am-shrooms', label: 'AM Shrooms', emoji: '🍄', completed: false },
    { id: 'pm-shrooms', label: 'PM Shrooms', emoji: '🍄', completed: false },
    { id: 'sleep-clean-slate', label: 'Sleep Clean Slate', emoji: '🌙', completed: false },
    { id: 'psyllium-husk', label: 'Psyllium Husk', emoji: '🌾', completed: false },
  ];
  const [dailyChecklist, setDailyChecklist] = useState<DailyCheckItem[]>(DEFAULT_DAILY_CHECKLIST);
  const [lastChecklistResetDate, setLastChecklistResetDate] = useState<string>('');
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);

  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data whenever state changes (debounced)
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        saveData();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [items, allies, journalEntries, substanceJournalEntries, completions, patterns, foodEntries, movementEntries, dreamseeds, conversations, fieldWhispers, archetypes, activeContainer, selectedTheme, dailyChecklist, lastChecklistResetDate, activeTimers, loading]);

  const loadData = useCallback(async () => {
    // Run migration if needed before loading data
    if (await needsMigration()) {
      await runMigration();
    }
    
    const savedState = await loadAppState();
    if (savedState) {
      // normalize incoming state for backward compatibility
      const normalizeMoment = (m: any) => ({
        ...m,
        tone: m.tone || '',
        frequency: m.frequency || '',
        presence: m.presence || '',
        context: m.context || '',
        action_reflection: m.action_reflection || '',
        result_shift: m.result_shift || '',
        conclusion_offering: m.conclusion_offering || '',
        text: m.text || '',
      });

      const normalized = {
        items: Array.isArray(savedState.items) && savedState.items.length > 0 ? savedState.items : DEFAULT_GROUNDING_ITEMS,
        allies: Array.isArray(savedState.allies) && savedState.allies.length > 0 ? savedState.allies : DEFAULT_ALLIES,
        journalEntries: Array.isArray(savedState.journalEntries) ? savedState.journalEntries.map(normalizeMoment) : [],
        substanceJournalEntries: Array.isArray(savedState.substanceJournalEntries) ? savedState.substanceJournalEntries.map(normalizeMoment) : [],
        completions: Array.isArray(savedState.completions) ? savedState.completions : [],
        patterns: Array.isArray(savedState.patterns) ? savedState.patterns : [],
        foodEntries: Array.isArray(savedState.foodEntries) ? savedState.foodEntries : [],
        movementEntries: Array.isArray(savedState.movementEntries) ? savedState.movementEntries : [],
        dreamseeds: Array.isArray(savedState.dreamseeds) ? savedState.dreamseeds : [],
        conversations: Array.isArray(savedState.conversations) ? savedState.conversations : [],
        fieldWhispers: Array.isArray(savedState.fieldWhispers) ? savedState.fieldWhispers : [],
        archetypes: Array.isArray(savedState.archetypes) && savedState.archetypes.length > 0 ? savedState.archetypes : DEFAULT_ARCHETYPES,
        activeContainer: getCurrentContainer(), // Always use current time, don't load stale value
        selectedTheme: savedState.selectedTheme || DEFAULT_THEME,
      } as AppState;

      setItems(normalized.items);
      setAllies(normalized.allies);
      setSelectedTheme((normalized.selectedTheme as ThemeName) || DEFAULT_THEME);
      setJournalEntries(normalized.journalEntries);
      setSubstanceJournalEntries(normalized.substanceJournalEntries);
      setCompletions(normalized.completions);
      setPatterns(normalized.patterns);
      setFoodEntries(normalized.foodEntries);
      setMovementEntries(normalized.movementEntries || []);
      setDreamseeds(normalized.dreamseeds);
      setConversations(normalized.conversations);
      setFieldWhispers(normalized.fieldWhispers);
      setArchetypes(normalized.archetypes);
      setActiveContainer(normalized.activeContainer);

      // Load daily rituals with 4am reset check
      const savedRituals = savedState.dailyRituals;
      const savedTimers = savedState.activeTimers || [];
      
      // Check if we need to reset the checklist (4am reset)
      const now = new Date();
      const todayResetDate = get4amResetDate(now);
      
      if (savedRituals && savedRituals.lastResetDate === todayResetDate) {
        // Same day, keep the saved state
        setDailyChecklist(savedRituals.checklist);
        setLastChecklistResetDate(savedRituals.lastResetDate);
      } else {
        // New day (past 4am), reset the checklist
        setDailyChecklist(DEFAULT_DAILY_CHECKLIST);
        setLastChecklistResetDate(todayResetDate);
      }
      
      // Filter out expired timers
      const validTimers = savedTimers.filter((t: ActiveTimer) => t.endTime > Date.now());
      setActiveTimers(validTimers);
    }
    setLoading(false);
  }, []);

  const saveData = useCallback(async () => {
    await saveAppState({
      items,
      allies,
      journalEntries,
      substanceJournalEntries,
      completions,
      patterns,
      foodEntries,
      movementEntries,
      dreamseeds,
      conversations,
      fieldWhispers,
      archetypes,
      activeContainer,
      selectedTheme,
      dailyRituals: {
        checklist: dailyChecklist,
        lastResetDate: lastChecklistResetDate,
      },
      activeTimers,
    });
  }, [items, allies, journalEntries, substanceJournalEntries, completions, patterns, foodEntries, movementEntries, dreamseeds, conversations, fieldWhispers, archetypes, activeContainer, selectedTheme, dailyChecklist, lastChecklistResetDate, activeTimers]);

  const addItem = useCallback((item: Omit<ContainerItem, 'id'>) => {
    const now = new Date();
    const newItem: ContainerItem = {
      ...item,
      id: generateId(),
      createdAt: now.toISOString(),
      createdTimestamp: now.getTime(),
    };
    setItems(prev => [...prev, newItem]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setCompletions(prev => prev.filter(c => c.itemId !== id));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<ContainerItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const toggleCompletion = useCallback((itemId: string) => {
    const today = formatDate();
    const existingCompletion = completions.find(
      c => c.itemId === itemId && c.date === today
    );

    if (existingCompletion) {
      // Remove completion
      setCompletions(prev => prev.filter(c => c !== existingCompletion));
    } else {
      // Add completion
      const newCompletion: Completion = {
        itemId,
        date: today,
        timestamp: Date.now(),
      };
      setCompletions(prev => [...prev, newCompletion]);
    }
  }, [completions]);

  const isCompleted = useCallback((itemId: string): boolean => {
    const today = formatDate();
    return completions.some(c => c.itemId === itemId && c.date === today);
  }, [completions]);

  const addAlly = useCallback((ally: Omit<Ally, 'id'>) => {
    const now = new Date();
    const newAlly: Ally = {
      ...ally,
      id: generateId(),
      createdAt: now.toISOString(),
      createdTimestamp: now.getTime(),
    };
    setAllies(prev => [...prev, newAlly]);
  }, []);

  const updateAlly = useCallback((ally: Ally) => {
    setAllies(prev => prev.map(a => a.id === ally.id ? ally : a));
  }, []);

  const removeAlly = useCallback((id: string) => {
    setAllies(prev => prev.filter(a => a.id !== id));
  }, []);

  const addMoment = useCallback((moment: Omit<Moment, 'id' | 'timestamp' | 'date'>) => {
    const newMoment: Moment = {
      ...moment,
      id: generateId(),
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };
    setJournalEntries(prev => [newMoment, ...prev]);

    // Update ally log if an ally was involved
    if (newMoment.allyId) {
      setAllies(prevAllies => prevAllies.map(ally => {
        if (ally.id === newMoment.allyId) {
          return {
            ...ally,
            log: [newMoment, ...ally.log],
          };
        }
        return ally;
      }));
    }
  }, [activeContainer]);

  // Add moment specifically to Substances journal (separate from main journal)
  const addSubstanceMoment = useCallback((moment: Omit<Moment, 'id' | 'timestamp' | 'date'>) => {
    const newMoment: Moment = {
      ...moment,
      id: generateId(),
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };
    setSubstanceJournalEntries(prev => [newMoment, ...prev]);

    // Invalidate relationship profile cache for this substance so voices
    // have fresh data the next time they are invoked.
    if (newMoment.allyName) {
      (async () => {
        const { invalidateRelationshipProfile } = await import('../_services/council/relationshipProfile');
        await invalidateRelationshipProfile(newMoment.allyName!);
      })();
    }

    // Notify Field Arbiter and write agent journal entry
    (async () => {
      const { processEvent, logDecision } = await import('../_services/fieldArbiter');
      const { writeJournalEntry, generateSubstanceObservation } = await import('../_services/agentJournal');
      
      // Process through arbiter
      const decision = await processEvent({
        event: 'SUBSTANCE_LOGGED',
        metadata: {
          substanceName: newMoment.allyName || 'unknown',
          momentId: newMoment.id,
        },
      });
      logDecision({ event: 'SUBSTANCE_LOGGED', metadata: { substanceName: newMoment.allyName } }, decision);
      
      // Write private journal entry (Phase 1: always write, regardless of arbiter decision)
      if (decision.voice) {
        const template = generateSubstanceObservation(
          decision.voice,
          newMoment.allyName || 'unknown',
          newMoment.text
        );
        
        await writeJournalEntry(
          decision.voice,
          template.observation,
          {
            context: newMoment.allyName,
            sentiment: template.sentiment,
            eventType: 'SUBSTANCE_LOGGED',
          }
        );
      }
      
      // Phase 2 (future): If arbiter allows, promote journal entry to public output
    })();

    // Update ally log if an ally was involved
    if (newMoment.allyId) {
      setAllies(prevAllies => prevAllies.map(ally => {
        if (ally.id === newMoment.allyId) {
          return {
            ...ally,
            log: [newMoment, ...ally.log],
          };
        }
        return ally;
      }));
    }
  }, [activeContainer]);

  // Keeping logAllyUse for now, but redirecting it to the new addMoment
  const logAllyUse = useCallback((ally: Ally, details?: Partial<Moment>) => {
    // Ally object is passed directly from AllyCard/index.tsx
    if (!ally || !ally.name) {
      console.error(`Ally object invalid: ${ally}`);
      return;
    }
    const moment = {
      text: `Used ${ally.name}`,
      container: activeContainer,
      allyId: ally.id,
      allyName: ally.name,
      // Default values for new fields
      tone: details?.tone || '',
      frequency: details?.frequency || '',
      presence: details?.presence || '',
      context: details?.context || '',
      action_reflection: details?.action_reflection || '',
      result_shift: details?.result_shift || '',
      conclusion_offering: details?.conclusion_offering || '',
      ...details,
    } as Omit<Moment, 'id' | 'timestamp' | 'date'>;
    addMoment(moment);
  }, [activeContainer, allies, addMoment]);


  const addPattern = useCallback((pattern: Omit<Pattern, 'id' | 'timestamp' | 'date'>) => {
    const now = new Date();
    const newPattern: Pattern = {
      ...pattern,
      id: generateId(),
      date: now.toISOString(),
      timestamp: now.getTime(),
    };
    setPatterns(prev => [newPattern, ...prev]);
  }, []);

  const addConversation = useCallback((conversation: Omit<import('../_constants/Types').Conversation, 'id' | 'timestamp' | 'date'>) => {
    const now = new Date();
    const newConversation: import('../_constants/Types').Conversation = {
      ...conversation,
      id: generateId(),
      date: now.toISOString(),
      timestamp: now.getTime(),
    };
    setConversations(prev => [newConversation, ...prev]);
  }, []);

  const addFieldWhisper = useCallback((whisper: Omit<import('../_constants/Types').FieldWhisper, 'id' | 'timestamp' | 'date'>) => {
    const now = new Date();
    const newWhisper: import('../_constants/Types').FieldWhisper = {
      ...whisper,
      id: generateId(),
      date: now.toISOString(),
      timestamp: now.getTime(),
    };
    setFieldWhispers(prev => [newWhisper, ...prev]);
  }, []);

  const removePattern = useCallback((id: string) => {
    setPatterns(prev => prev.filter(p => p.id !== id));
  }, []);

  const addFoodEntry = useCallback((entry: Omit<FoodEntry, 'id' | 'timestamp' | 'date'>) => {
    const now = new Date();
    const newEntry: FoodEntry = {
      ...entry,
      id: generateId(),
      date: now.toISOString(),
      timestamp: now.getTime(),
    };
    setFoodEntries(prev => [newEntry, ...prev]);
  }, []);

  const addDreamseed = useCallback((word: string) => {
    const now = new Date();
    const newDreamseed: import('../_constants/Types').Dreamseed = {
      id: generateId(),
      date: now.toISOString(),
      timestamp: now.getTime(),
      word,
    };
    setDreamseeds(prev => [newDreamseed, ...prev]);
  }, []);

  const removeFoodEntry = useCallback((id: string) => {
    setFoodEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const updateFoodEntry = useCallback((id: string, updates: Partial<FoodEntry>) => {
    setFoodEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const addMovementEntry = useCallback((entry: Omit<MovementEntry, 'id' | 'timestamp' | 'date'>) => {
    const now = new Date();
    const newEntry: MovementEntry = {
      ...entry,
      id: generateId(),
      date: now.toISOString(),
      timestamp: now.getTime(),
    };
    setMovementEntries(prev => [newEntry, ...prev]);
  }, []);

  const removeMovementEntry = useCallback((id: string) => {
    setMovementEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const updateMovementEntry = useCallback((id: string, updates: Partial<MovementEntry>) => {
    setMovementEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const addArchetype = useCallback((archetype: Partial<Omit<Archetype, 'id'>>) => {
    const now = new Date();
    const newArchetype: Archetype = {
      name: archetype.name || 'New Archetype',
      subtitle: archetype.subtitle || '',
      icon: archetype.icon || '🔮',
      bio: archetype.bio || '',
      activation_phrase: archetype.activation_phrase || '',
      body_cue: archetype.body_cue || '',
      invocation_visualization: archetype.invocation_visualization || '',
      deactivation_phrase: archetype.deactivation_phrase || '',
      color_theme: archetype.color_theme || { accent: '#8B5CF6', overlay: 'rgba(139, 92, 246, 0.1)' },
      theme: archetype.theme,
      ...archetype,
      id: generateId(),
      isDefault: false,
      createdAt: now.toISOString(),
      createdTimestamp: now.getTime(),
    };
    setArchetypes(prev => [...prev, newArchetype]);
  }, []);

  const updateArchetype = useCallback((archetype: Archetype) => {
    setArchetypes(prev => prev.map(a => a.id === archetype.id ? archetype : a));
  }, []);

  const removeArchetype = useCallback((id: string) => {
    setArchetypes(prev => prev.filter(a => a.id !== id));
  }, []);

  // Helper: Get the "reset date" for 4am boundary
  // If it's before 4am, we're still on "yesterday's" day
  const get4amResetDate = (date: Date): string => {
    const d = new Date(date);
    if (d.getHours() < 4) {
      d.setDate(d.getDate() - 1);
    }
    return d.toISOString().split('T')[0];
  };

  // Toggle a daily checklist item
  const toggleDailyCheckItem = useCallback((id: string) => {
    setDailyChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  }, []);

  // Start a timer with optional notification (notifications don't work in Expo Go)
  const startTimer = useCallback(async (minutes: number, label: string) => {
    const endTime = Date.now() + (minutes * 60 * 1000);
    const timerId = generateId();
    
    // Try to schedule notification (will fail silently in Expo Go)
    let notificationId: string | undefined;
    try {
      const Notifications = await import('expo-notifications').then(m => m.default || m);
      if (Notifications?.requestPermissionsAsync) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted' && Notifications?.scheduleNotificationAsync) {
          notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: '⏰ Timer Complete',
              body: label,
              sound: true,
            },
            trigger: {
              type: 'timeInterval' as any,
              seconds: minutes * 60,
            },
          });
        }
      }
    } catch (e) {
      // Notifications not available (Expo Go) - timer will still work, just no push notification
      console.log('Notifications not available - timer will work without alerts');
    }
    
    const newTimer: ActiveTimer = {
      id: timerId,
      label,
      endTime,
      notificationId,
    };
    
    setActiveTimers(prev => [...prev, newTimer]);
  }, []);

  // Cancel a timer
  const cancelTimer = useCallback(async (id: string) => {
    const timer = activeTimers.find(t => t.id === id);
    
    // Try to cancel notification if one was scheduled
    if (timer?.notificationId) {
      try {
        const Notifications = await import('expo-notifications').then(m => m.default || m);
        if (Notifications?.cancelScheduledNotificationAsync) {
          await Notifications.cancelScheduledNotificationAsync(timer.notificationId);
        }
      } catch (e) {
        // Notifications not available - just remove the timer
      }
    }
    
    setActiveTimers(prev => prev.filter(t => t.id !== id));
  }, [activeTimers]);

  // Check for 4am reset on interval (every minute)
  useEffect(() => {
    const checkReset = () => {
      const now = new Date();
      const todayResetDate = get4amResetDate(now);
      
      if (lastChecklistResetDate && lastChecklistResetDate !== todayResetDate) {
        // It's a new day (past 4am), reset the checklist
        setDailyChecklist(DEFAULT_DAILY_CHECKLIST);
        setLastChecklistResetDate(todayResetDate);
      }
    };
    
    const interval = setInterval(checkReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lastChecklistResetDate]);

  // Clean up expired timers
  useEffect(() => {
    const cleanupTimers = () => {
      const now = Date.now();
      setActiveTimers(prev => prev.filter(t => t.endTime > now));
    };
    
    const interval = setInterval(cleanupTimers, 1000); // Check every second
    return () => clearInterval(interval);
  }, []);

  const value: AppContextType = {
    removeJournalEntry,
    removeSubstanceJournalEntry,
    updateSubstanceJournalEntry,
    items,
    allies,
    journalEntries,
    substanceJournalEntries,
    completions,
    patterns,
    foodEntries,
    movementEntries,
    dreamseeds,
    conversations,
    fieldWhispers,
    archetypes,
    activeContainer,


    addItem,
    removeItem,
    updateItem,
    toggleCompletion,
    isCompleted,
    addAlly,
    updateAlly,
    removeAlly,
    logAllyUse,
    addMoment,
    addSubstanceMoment,
    addPattern,
    removePattern,
    addConversation,
    addFieldWhisper,
    addFoodEntry,
    removeFoodEntry,
    updateFoodEntry,
    addMovementEntry,
    removeMovementEntry,
    updateMovementEntry,
    addDreamseed,
    addArchetype,
    updateArchetype,
    removeArchetype,
    setActiveContainer,
    activeArchetypeId,
    setActiveArchetypeId,
    selectedTheme,
    setSelectedTheme,
    loading,
    // Timer & Daily Rituals
    dailyChecklist,
    activeTimers,
    toggleDailyCheckItem,
    startTimer,
    cancelTimer,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

