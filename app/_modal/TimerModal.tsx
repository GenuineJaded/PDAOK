import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { isRunningInExpoGo } from 'expo';
import useColors from '../_hooks/useColors';

// Configure notifications only when not in Expo Go
// (expo-notifications push/schedule features require a development build)
if (!isRunningInExpoGo()) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

interface DailyCheckItem {
  id: string;
  label: string;
  emoji: string;
  completed: boolean;
}

interface ActiveTimer {
  id: string;
  label: string;
  endTime: number; // timestamp when timer ends
  notificationId?: string;
}

interface TimerModalProps {
  isVisible: boolean;
  onClose: () => void;
  dailyChecklist: DailyCheckItem[];
  onToggleCheckItem: (id: string) => void;
  activeTimers: ActiveTimer[];
  onStartTimer: (minutes: number, label: string) => void;
  onCancelTimer: (id: string) => void;
}

/**
 * Timer & Daily Checklist Modal
 * - Preset timers: 30 min, 2 hours
 * - Custom timer input
 * - Daily checklist that resets at 4am
 */
export const TimerModal: React.FC<TimerModalProps> = ({
  isVisible,
  onClose,
  dailyChecklist,
  onToggleCheckItem,
  activeTimers,
  onStartTimer,
  onCancelTimer,
}) => {
  const colors = useColors();
  const [now, setNow] = useState(Date.now());
  
  // Update "now" every second to show countdown
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isVisible]);

  const formatTimeRemaining = (endTime: number): string => {
    const remaining = Math.max(0, endTime - now);
    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartPreset = (minutes: number, label: string) => {
    onStartTimer(minutes, label);
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.container, { backgroundColor: colors.card }]}
          onStartShouldSetResponder={() => true}
        >
          <Text style={[styles.title, { color: colors.text }]}>⏱️ Timers & Rituals</Text>
          
          {/* Active Timers Section */}
          {activeTimers.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.dim }]}>ACTIVE TIMERS</Text>
              {activeTimers.map((timer) => (
                <View 
                  key={timer.id} 
                  style={[styles.activeTimerRow, { backgroundColor: colors.bg }]}
                >
                  <View style={styles.timerInfo}>
                    <Text style={[styles.timerLabel, { color: colors.text }]}>{timer.label}</Text>
                    <Text style={[styles.timerCountdown, { color: colors.accent }]}>
                      {formatTimeRemaining(timer.endTime)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.cancelTimerButton, { borderColor: colors.dim }]}
                    onPress={() => onCancelTimer(timer.id)}
                  >
                    <Text style={[styles.cancelTimerText, { color: colors.dim }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Preset Timers */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.dim }]}>QUICK TIMERS</Text>
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={[styles.presetButton, { backgroundColor: colors.accent }]}
                onPress={() => handleStartPreset(30, '30 min')}
              >
                <Text style={[styles.presetButtonText, { color: colors.card }]}>30 min</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetButton, { backgroundColor: colors.accent }]}
                onPress={() => handleStartPreset(60, '1 hour')}
              >
                <Text style={[styles.presetButtonText, { color: colors.card }]}>1 hour</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetButton, { backgroundColor: colors.accent }]}
                onPress={() => handleStartPreset(120, '2 hours')}
              >
                <Text style={[styles.presetButtonText, { color: colors.card }]}>2 hours</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Daily Checklist */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.dim }]}>DAILY RITUALS</Text>
            <Text style={[styles.resetNote, { color: colors.dim }]}>Resets at 4:00 AM</Text>
            {dailyChecklist.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.checklistItem, { backgroundColor: colors.bg }]}
                onPress={() => onToggleCheckItem(item.id)}
              >
                <View style={[
                  styles.checkbox, 
                  { borderColor: colors.accent },
                  item.completed && { backgroundColor: colors.accent }
                ]}>
                  {item.completed && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.checklistEmoji}>{item.emoji}</Text>
                <Text style={[
                  styles.checklistLabel, 
                  { color: colors.text },
                  item.completed && styles.completedLabel
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.closeButton, { borderColor: colors.dim }]}
            onPress={onClose}
          >
            <Text style={[styles.closeText, { color: colors.dim }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
  },
  resetNote: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: -6,
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  activeTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  timerInfo: {
    flex: 1,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  timerCountdown: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  cancelTimerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelTimerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  checklistEmoji: {
    fontSize: 20,
  },
  checklistLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  completedLabel: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TimerModal;
