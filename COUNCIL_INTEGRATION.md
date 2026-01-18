# Council Voice System Integration

This document describes the integration of the Council resonance architecture into the PDA.OK main application.

## Overview

The Council Voice System is now fully integrated and running alongside the existing transmission system. The new system replaces the mechanical AI trigger approach with a petition-based voice system where voices have agency within bounds.

## Integration Summary

### Changes Made to `app/(tabs)/index.tsx`

1. **New Imports** (lines 69-71):
   ```typescript
   import { CouncilToast } from '../_components/CouncilToast';
   import { useCouncil } from '../_hooks/useCouncil';
   import { startBreathingScheduler, recordSchedulerActivity } from '../_services/council';
   ```

2. **useCouncil Hook** (lines 134-139):
   ```typescript
   const {
     currentTransmission,
     dismissTransmission,
     recordActivity: recordCouncilActivity,
   } = useCouncil();
   ```

3. **Breathing Scheduler Initialization** (lines 246-251):
   ```typescript
   useEffect(() => {
     startBreathingScheduler();
     console.log('[Council] Breathing scheduler started');
   }, []);
   ```

4. **Activity Recording** - Added to `handleCompletion` and `markAsAligned`:
   ```typescript
   recordSchedulerActivity();
   ```

5. **CouncilToast Component** - Added to global return section (lines 1590-1596):
   ```typescript
   <CouncilToast
     transmission={currentTransmission}
     colors={colors}
     container={activeContainer}
     onDismiss={dismissTransmission}
   />
   ```

## How It Works

### Breathing Cycle

The system breathes with the user:

| Phase | Duration | Behavior |
|-------|----------|----------|
| **Inhale** | 30 min after activity | User is active, voices observe |
| **Hold** | 5 min | Petitions form |
| **Exhale** | 10 min | Arbiter decides, transmissions surface |
| **Stillness** | 15 min | Nothing speaks, even if eligible |

### Voice Petition Flow

1. **Signal Collection**: The system collects signals from substance logs, anchor completions, and patterns
2. **Voice Selection**: Relevant voices are determined based on signal types
3. **Petition Generation**: Each voice generates a petition (or chooses silence)
4. **Arbiter Evaluation**: The Three Keys (Change, Convergence, Cost) must all turn
5. **Transmission**: If approved, the message surfaces as a toast

### Daily Limits

- **8 toasts** per day
- **4 transmissions** per day
- **1 synthesis** per day

### Cooldowns

- **30 minutes** global minimum between any speech
- **4 hours** before same voice speaks again
- **2 hours** before same theme surfaces

## Files in the Council System

| File | Purpose |
|------|---------|
| `types.ts` | Core type definitions (VoiceId, Petition, etc.) |
| `voiceIdentities.ts` | Full identity profiles for all 14 voices |
| `arbiter.ts` | Three-key gating system |
| `voiceEngine.ts` | Gemini-powered petition generation |
| `signalCollector.ts` | Data signal collection |
| `orchestrator.ts` | Full cycle coordination |
| `breathingScheduler.ts` | Phase-aware scheduling |
| `CouncilToast.tsx` | UI component for transmissions |
| `useCouncil.ts` | React hook for state management |

## Testing the Integration

1. **Check Console Logs**: Look for `[Council]` and `[BreathingScheduler]` messages
2. **Trigger Activity**: Complete anchors or align items to record activity
3. **Wait for Exhale**: After ~35 minutes of inactivity, the system should exhale
4. **Watch for Toasts**: If signals are present and a petition passes, a toast appears

## Coexistence with Old System

The new Council system runs alongside the existing `useTransmissions` system. Both can surface messages independently:

- **Old system**: Uses `FieldTransmissions` component on the transmissions screen
- **New system**: Uses `CouncilToast` globally on all screens

## Future Considerations

1. **Full Transition**: Once stable, the old system can be deprecated
2. **More Activity Hooks**: Add `recordSchedulerActivity()` to more user interactions
3. **Voice Tuning**: Adjust voice identities and petition thresholds based on user feedback
4. **Scratchpad UI**: Consider exposing voice scratchpads for debugging/transparency

## Commit Reference

```
cd2eb74 feat: Integrate Council Voice System into main app
```
