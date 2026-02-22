import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ColorScheme } from '../_constants/Types';
import { getSynthesisHistory, DailySynthesis } from '../_services/dailySynthesis';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: ColorScheme;
}

export const SynthesisHistoryModal: React.FC<Props> = ({ visible, onClose, colors }) => {
  const [history, setHistory] = useState<DailySynthesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadHistory();
    }
  }, [visible]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const syntheses = await getSynthesisHistory();
      setHistory(syntheses);
    } catch (error) {
      console.error('Error loading synthesis history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background || colors.bg }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Daily Reflections
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: colors.dim }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.dim }]}>
                Loading reflections...
              </Text>
            </View>
          ) : history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.dim }]}>
                No reflections yet. Generate your first evening synthesis to begin the archive.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {history.map((synthesis, index) => (
                <View
                  key={synthesis.date}
                  style={[
                    styles.synthesisItem,
                    { 
                      backgroundColor: colors.card,
                      borderColor: colors.dim,
                    },
                  ]}
                >
                  <View style={styles.synthesisHeader}>
                    <Text style={[styles.dateText, { color: colors.accent }]}>
                      {formatDate(synthesis.date)}
                    </Text>
                    <View style={styles.statsRow}>
                      <Text style={[styles.statText, { color: colors.dim }]}>
                        {synthesis.stats.completed} completed
                      </Text>
                      <Text style={[styles.statText, { color: colors.dim }]}>
                        •
                      </Text>
                      <Text style={[styles.statText, { color: colors.dim }]}>
                        {synthesis.stats.total} total
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.synthesisText, { color: colors.text }]}>
                    {synthesis.synthesis}
                  </Text>
                </View>
              ))}
              
              <View style={styles.bottomSpacer} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    fontWeight: '300',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  synthesisItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  synthesisHeader: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  synthesisText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 24,
  },
});
