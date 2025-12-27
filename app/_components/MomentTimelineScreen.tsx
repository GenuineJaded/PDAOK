import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useApp } from '../_context/AppContext';
import { ColorScheme, Moment } from '../_constants/Types';
import { formatLongDate, formatTime } from '../_utils/time';

interface MomentTimelineScreenProps {
  colors: ColorScheme;
  onBack: () => void;
}

const MomentCard: React.FC<{ moment: Moment, colors: ColorScheme }> = ({ moment, colors }) => {
  const date = new Date(moment.date);
  const formattedDate = formatLongDate(date);
  const formattedTime = formatTime(date);

  return (
    <View style={[styles.momentCard, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.timeText, { color: colors.accent }]}>{formattedTime}</Text>
        <Text style={[styles.dateText, { color: colors.dim }]}>{formattedDate}</Text>
      </View>
      
      {/* Ally/Anchor Summary */}
      {(moment.allyName || moment.anchorTitle) && (
        <View style={styles.summaryContainer}>
          {moment.allyName && (
            <Text style={[styles.summaryText, { color: colors.text }]}>
              Ally: <Text style={{ fontWeight: 'bold' }}>{moment.allyName}</Text>
            </Text>
          )}
          {moment.anchorTitle && (
            <Text style={[styles.summaryText, { color: colors.text }]}>
              Anchor: <Text style={{ fontWeight: 'bold' }}>{moment.anchorTitle}</Text>
            </Text>
          )}
        </View>
      )}

	      {/* Journalistic Synthesis (The Living Journal) */}
	      <View style={styles.synthesisContainer}>
	        <Text style={[styles.synthesisTitle, { color: colors.dim }]}>Journalistic Synthesis</Text>
	        
	        <Text style={[styles.synthesisItem, { color: colors.text, fontWeight: 'bold' }]}>
	          Tone: {moment.tone || 'N/A'} - Frequency: {moment.frequency || 'N/A'} - Presence: {moment.presence || 'N/A'}
	        </Text>
	
	        {moment.context && <Text style={[styles.reflectionPrompt, { color: colors.text }]}>
	          <Text style={{ fontWeight: 'bold', color: colors.accent }}>The Setting of the Altar:</Text> {moment.context}
	        </Text>}
	        {moment.action_reflection && <Text style={[styles.reflectionPrompt, { color: colors.text }]}>
	          <Text style={{ fontWeight: 'bold', color: colors.accent }}>The Invocation:</Text> {moment.action_reflection}
	        </Text>}
	        {moment.result_shift && <Text style={[styles.reflectionPrompt, { color: colors.text }]}>
	          <Text style={{ fontWeight: 'bold', color: colors.accent }}>The Field Report:</Text> {moment.result_shift}
	        </Text>}
	        {moment.conclusion_offering && <Text style={[styles.reflectionPrompt, { color: colors.text }]}>
	          <Text style={{ fontWeight: 'bold', color: colors.accent }}>The Offering:</Text> {moment.conclusion_offering}
	        </Text>}
	      </View>

      {/* Full Text Entry */}
      {moment.text && (
        <View style={styles.textContainer}>
          <Text style={[styles.textTitle, { color: colors.dim }]}>Field Note</Text>
          <Text style={[styles.textBody, { color: colors.text }]}>{moment.text}</Text>
        </View>
      )}
    </View>
  );
};

export const MomentTimelineScreen: React.FC<MomentTimelineScreenProps> = ({ colors, onBack }) => {
  const { journalEntries } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
	          <Text style={[styles.title, { color: colors.text }]}>Patterns</Text>
	          <Text style={[styles.subtitle, { color: colors.dim }]}>A chronological field report of your Moments (The Living Journal)</Text>
        </View>

        {journalEntries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.dim }]}>
              No Moments recorded yet. Craft your first Moment to begin your journal.
            </Text>
          </View>
        ) : (
          journalEntries.map(moment => (
            <MomentCard key={moment.id} moment={moment} colors={colors} />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.accent }]}
        onPress={onBack}
      >
        <Text style={[styles.backButtonText, { color: colors.card }]}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  momentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)', // Placeholder, will be replaced by dim color
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)', // Placeholder
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '400',
  },
  summaryContainer: {
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    marginBottom: 4,
  },
  synthesisContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)', // Placeholder
    marginBottom: 12,
  },
  synthesisTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  synthesisItem: {
    fontSize: 15,
    marginBottom: 8,
  },
  reflectionPrompt: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  textContainer: {
    marginTop: 8,
  },
  textTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  textBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
  backButton: {
    position: 'absolute',
    bottom: 70, // Above the nav bar
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
