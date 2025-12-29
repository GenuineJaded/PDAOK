import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  LogBox, // Import LogBox
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../_context/AppContext';
import useColors from '../_hooks/useColors';
import { useTransmissions } from '../_hooks/useTransmissions';
import { formatTime, formatLongDate, getCurrentContainer } from '../_utils/time';
import { ContainerThemes } from '../_constants/Colors';
import { AnchorCard } from '../_components/AnchorCard';
import { TaskDetailScreen } from '../_components/TaskDetailScreen';
import { CollapsibleSection } from '../_components/CollapsibleSection';
import { CraftMomentModal } from '../modal';
import { Modal } from '../_components/Modal';
import { Alert } from 'react-native';
import { ANALYSIS_URL, REQUEST_TIMEOUT_MS, TEST_MODE } from '../_constants/Config';
import { ContainerId } from '../_constants/Types';
import { TemporalIntelligenceCard } from '../_components/TemporalIntelligenceCard';
import { DailySynthesisModal } from '../_modal/DailySynthesisModal';
import { SynthesisHistoryModal } from '../_components/SynthesisHistoryModal';
import { ConversationCard } from '../_components/ConversationCard';
import { CompletionPulse } from '../_components/CompletionPulse';
import { ShiftToast } from '../_components/ShiftToast';
import { ActionToast } from '../_components/ActionToast';
import UltraMicroModal from '../_modal/UltraMicroModal';
import { ThresholdCard } from '../_components/ThresholdCard';
import { BloomEffect } from '../_components/BloomEffect';
import { RingPulse } from '../_components/RingPulse';

// Conditional imports moved outside the component to fix "Rendered more hooks" error
import { AllyCard } from '../_components/AllyCard';
import { JournalEntryCard } from '../_components/JournalEntryCard';
import { PatternCard } from '../_components/PatternCard';
import { FoodEntryCard } from '../_components/FoodEntryCard';
import { AddAllyModal, EditAllyModal } from '../modal';
import { DailyBlockSynthesisModal } from '../_modal/DailyBlockSynthesisModal';
import { SubstanceSynthesisModal } from '../_modal/SubstanceSynthesisModal';
import { AddPatternModal } from '../_modal/AddPatternModal';
import { AddFoodModal } from '../_modal/AddFoodModal';
import { AddMovementModal } from '../_modal/AddMovementModal';
import { DreamseedModal } from '../_modal/DreamseedModal';
import { Archetype } from '../_constants/Types';
import { ArchetypeCard } from '../_components/ArchetypeCard';
import { ArchetypeDetailModal } from '../_modal/ArchetypeDetailModal';
import { AddArchetypeModal } from '../_modal/AddArchetypeModal';
import { EditArchetypeModal } from '../_modal/EditArchetypeModal';
import { ReturnNode } from '../_components/ReturnNode';
import { FieldWhisperSequence } from '../_components/FieldWhisperSequence';
import { generateFieldWhispers } from '../_services/fieldWhisper';
import { JournalList } from '../_components/JournalList';
import { JournalEntryModal } from '../_components/JournalEntryModal';
import FieldTransmissions from '../_components/FieldTransmissions';
import { AlchemicalSymbol } from '../_components/AlchemicalSymbol';
import { QuickLogModal } from '../_modal/QuickLogModal';
import { QuickSubstanceLogModal } from '../_modal/QuickSubstanceLogModal';
import { EditFoodModal } from '../_modal/EditFoodModal';
import { EditMovementModal } from '../_modal/EditMovementModal';
import { EditSubstanceModal } from '../_modal/EditSubstanceModal';

type Screen = 'home' | 'substances' | 'archetypes' | 'patterns' | 'nourish' | 'transmissions';

export default function HomeScreen() {
  const {
    items,
    ambientRhythmEnabled,
    toggleAmbientRhythm,
    allies,
    activeContainer,
    setActiveContainer,
    selectedTheme,
    toggleCompletion,
    isCompleted,
    loading,
    addItem,
    removeItem,
    updateItem,
    journalEntries,
    substanceJournalEntries,
    removeJournalEntry,
    removeSubstanceJournalEntry,
    updateSubstanceJournalEntry,
    addMoment,
    addSubstanceMoment,
    addAlly,
    updateAlly,
    removeAlly,
    logAllyUse,
    patterns,
    addPattern,
    removePattern,
    conversations,
    addConversation,
    fieldWhispers,
    addFieldWhisper,
    foodEntries,
    addFoodEntry,
    removeFoodEntry,
    updateFoodEntry,
    movementEntries,
    addMovementEntry,
    removeMovementEntry,
    updateMovementEntry,
    dreamseeds,
    addDreamseed,
    archetypes,
    addArchetype,
    updateArchetype,
    removeArchetype,
    activeArchetypeId,
    setActiveArchetypeId,
  } = useApp();

  const { transmissions } = useTransmissions();

  const activeArchetype = activeArchetypeId 
    ? archetypes.find(a => a.id === activeArchetypeId) || null
    : null;

  // State declarations
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentTime, setCurrentTime] = useState(formatTime());

  // Use circadian colors based on active container
  // Blend with archetype colors if one is active
  const colors = useColors(
    activeContainer, 
    true, 
    undefined,
    activeArchetype,
    selectedTheme
  );
  
  // Separate colors for top navigation buttons - always use current time
  const currentTimeContainer = getCurrentContainer();
  const topButtonColors = useColors(currentTimeContainer, true, undefined, activeArchetype, selectedTheme);
  const [isCraftMomentModalVisible, setIsCraftMomentModalVisible] = useState(false);
  const [isAddAllyModalVisible, setIsAddAllyModalVisible] = useState(false);
  const [isEditAllyModalVisible, setIsEditAllyModalVisible] = useState(false);
  const [isSynthesisHistoryVisible, setIsSynthesisHistoryVisible] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<Array<{speaker: string; text: string; speakerType: 'substance' | 'archetype' | 'field'}>>([]);
  const [isSynthesisModalVisible, setIsSynthesisModalVisible] = useState(false);
  const [isSubstanceSynthesisModalVisible, setIsSubstanceSynthesisModalVisible] = useState(false);
  const [allyToEdit, setAllyToEdit] = useState(null);
  const [momentToSynthesize, setMomentToSynthesize] = useState<any>({});
  const [selectedItem, setSelectedItem] = useState<ContainerItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAnalysisModalVisible, setIsAnalysisModalVisible] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAddPatternModalVisible, setIsAddPatternModalVisible] = useState(false);
  const [isDailySynthesisModalVisible, setIsDailySynthesisModalVisible] = useState(false);
  const [isAddFoodModalVisible, setIsAddFoodModalVisible] = useState(false);
  const [isAddMovementModalVisible, setIsAddMovementModalVisible] = useState(false);
  const [isDreamseedModalVisible, setIsDreamseedModalVisible] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [isArchetypeModalVisible, setIsArchetypeModalVisible] = useState(false);
  const [isAddArchetypeModalVisible, setIsAddArchetypeModalVisible] = useState(false);
  const [isEditArchetypeModalVisible, setIsEditArchetypeModalVisible] = useState(false);
  const [archetypeToEdit, setArchetypeToEdit] = useState<Archetype | null>(null);
  
  // Somatic feedback state
  const [showCompletionPulse, setShowCompletionPulse] = useState(false);
  const [showShiftToast, setShowShiftToast] = useState(false);
  const [showActionToast, setShowActionToast] = useState(false);
  const [showRingPulse, setShowRingPulse] = useState(false);
  const [currentActionType, setCurrentActionType] = useState<'skipped' | 'forgot' | 'couldn\'t' | 'not relevant'>('skipped');
  const [showUltraMicroModal, setShowUltraMicroModal] = useState(false);
  const [ultraMicroData, setUltraMicroData] = useState<{ title: string; ultraMicro: string }>({ title: '', ultraMicro: '' });
  const [showThresholdCard, setShowThresholdCard] = useState(false);
  const [previousContainer, setPreviousContainer] = useState<ContainerId>(activeContainer);
  const [isManualTransition, setIsManualTransition] = useState(false);
  const [showBloomEffect, setShowBloomEffect] = useState(false);
  
  // Field Whisper state
  const [isGeneratingWhispers, setIsGeneratingWhispers] = useState(false);
  const [selectedJournalEntry, setSelectedJournalEntry] = useState<any>(null);
  const [isJournalEntryModalVisible, setIsJournalEntryModalVisible] = useState(false);
  const [activeWhispers, setActiveWhispers] = useState<string[]>([]);
  
  // Align Flow state - tracks which items have been aligned in current time period
  const [alignedItems, setAlignedItems] = useState<Set<string>>(new Set());
  
  // Quick Log state
  const [isQuickLogModalVisible, setIsQuickLogModalVisible] = useState(false);
  const [isQuickSubstanceModalVisible, setIsQuickSubstanceModalVisible] = useState(false);
  
  // Edit modal state
  const [isEditFoodModalVisible, setIsEditFoodModalVisible] = useState(false);
  const [isEditMovementModalVisible, setIsEditMovementModalVisible] = useState(false);
  const [isEditSubstanceModalVisible, setIsEditSubstanceModalVisible] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<any>(null);
  
  // ScrollView ref for scrolling to top
  const scrollViewRef = useRef<ScrollView>(null);
  const [showWhispers, setShowWhispers] = useState(false);
  
  // Reset aligned items when time container changes
  useEffect(() => {
    setAlignedItems(new Set());
  }, [activeContainer]);

  // Scroll to top when screen or time container changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentScreen, activeContainer]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Detect container changes and show threshold card (only for automatic transitions)
  useEffect(() => {
    if (previousContainer !== activeContainer && currentScreen === 'home') {
      // Only show threshold card if this is NOT a manual transition
      if (!isManualTransition) {
        setShowThresholdCard(true);
      }
      // Reset the manual transition flag
      setIsManualTransition(false);
    }
  }, [activeContainer, currentScreen, isManualTransition, previousContainer]);

  // Update previousContainer AFTER showing the threshold card
  useEffect(() => {
    if (!showThresholdCard && previousContainer !== activeContainer) {
      setPreviousContainer(activeContainer);
    }
  }, [showThresholdCard, activeContainer, previousContainer]);

  // Handle completion with somatic feedback
  const handleCompletion = (itemId: string) => {
    setShowCompletionPulse(true);   // Show pulse animation
    // Note: toggleCompletion is called before this in onComplete handler
  };

  // When pulse completes, show shift toast
  const handlePulseComplete = () => {
    setShowCompletionPulse(false);
    setShowShiftToast(true);
  };

  // Handle Field Whisper generation
  const handleListenToField = async () => {
    setIsGeneratingWhispers(true);
    try {
      const whispers = await generateFieldWhispers(
        conversations,
        patterns,
        journalEntries,
        substanceJournalEntries,
        allies,
        archetypes,
        activeArchetypeId
      );
      
      // Save whispers to storage
      addFieldWhisper({ whispers });
      
      // Display whispers as ephemeral overlay
      setActiveWhispers(whispers);
      setShowWhispers(true);
    } catch (error) {
      console.error('Error generating Field Whispers:', error);
      setActiveWhispers(['The Field is listening, but the signal is faint. Try again soon.']);
      setShowWhispers(true);
    } finally {
      setIsGeneratingWhispers(false);
    }
  };

  // Helper functions for shared modal (used by sub-screens, not home)
  const openEntryModal = (entry: any, title: string, entryType?: 'substance' | 'food' | 'movement') => {
    setSelectedJournalEntry({
      id: entry.id,
      title,
      date: entry.date,
      content: entry.fullContent,
      type: entryType,
    });
    setIsJournalEntryModalVisible(true);
  };

  const closeEntryModal = () => {
    setIsJournalEntryModalVisible(false);
    setSelectedJournalEntry(null);
  };

  // Mark an item as aligned (for Align Flow visual feedback)
  const markAsAligned = (itemId: string) => {
    setAlignedItems(prev => new Set(prev).add(itemId));
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Filter items by container and category
  const timeAnchors = items.filter(
    item => item.container === activeContainer && item.category === 'time'
  );
  const situationalAnchors = items.filter(
    item => item.container === activeContainer && item.category === 'situational'
  );
  const upliftAnchors = items.filter(
    item => item.container === activeContainer && item.category === 'uplift'
  );

  // Render 1x5 horizontal action buttons at top
  const renderActionGrid = () => (
    <View style={styles.actionGrid}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: 'transparent' }]}
        onPress={() => setCurrentScreen('substances')}
      >
        <Text style={[styles.actionIcon, { color: topButtonColors.accent }]}>🍃</Text>
        <Text style={[styles.actionText, { color: topButtonColors.text }]}>Substances</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: 'transparent' }]}
        onPress={() => setCurrentScreen('archetypes')}
      >
        <Text style={[styles.actionIcon, { color: topButtonColors.accent }]}>🎭</Text>
        <Text style={[styles.actionText, { color: topButtonColors.text }]}>Archetypes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: 'transparent' }]}
        onPress={() => setCurrentScreen('patterns')}
      >
        <Text style={[styles.actionIcon, { color: topButtonColors.accent }]}>🌌</Text>
        <Text style={[styles.actionText, { color: topButtonColors.text }]}>Patterns</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: 'transparent' }]}
        onPress={() => setCurrentScreen('nourish')}
      >
        <Text style={[styles.actionIcon, { color: topButtonColors.accent }]}>🍽️</Text>
        <Text style={[styles.actionText, { color: topButtonColors.text }]}>Nourish</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: 'transparent' }]}
        onPress={() => setCurrentScreen('transmissions')}
      >
        <Text style={[styles.actionIcon, { color: topButtonColors.accent }]}>📡</Text>
        <Text style={[styles.actionText, { color: topButtonColors.text }]}>Transmits</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Time Container Navigation at bottom with Craft a Moment button
  const renderTimeContainerNav = (showCraftButton: boolean = false) => {
    const containers: ContainerId[] = ['morning', 'afternoon', 'evening', 'late'];
    const icons = { morning: '🌅', afternoon: '☀️', evening: '🌇', late: '🌙' };
    
    return (
      <View>
        {/* Craft a Moment Button - Only show on home screen */}
        {showCraftButton ? (
          <TouchableOpacity
            style={[styles.craftMomentButton, { backgroundColor: colors.accent }]}
            onPress={() => setIsCraftMomentModalVisible(true)}
          >
            <Text style={[styles.craftMomentText, { color: colors.card }]}>📝 Craft a Moment 📝</Text>
          </TouchableOpacity>
        ) : null}

        {/* Time Container Navigation */}
        <View style={[styles.timeContainerNav, { backgroundColor: colors.bg, borderTopColor: colors.dim }]}>
          {containers.map(container => (
            <TouchableOpacity
              key={container}
              style={[
                styles.timeButton,
                activeContainer === container ? { backgroundColor: colors.accent + '20' } : null
              ]}
              onPress={() => {
                // Mark this as a manual transition
                setIsManualTransition(true);
                setActiveContainer(container);
                setCurrentScreen('home');
              }}
            >
              <Text style={[styles.timeIcon, { color: colors.accent }]}>{icons[container]}</Text>
              <Text style={[
                styles.timeText,
                { color: activeContainer === container ? colors.accent : colors.dim }
              ]}>
                {container.charAt(0).toUpperCase() + container.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Determine which screen to render
  let screenContent = null;

  // HOME SCREEN (Anchors)
  if (currentScreen === 'home') {
    screenContent = (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        
        {/* Quick Log Button - Floating Top Left */}
        <TouchableOpacity
          style={styles.quickLogButton}
          onPress={() => setIsQuickLogModalVisible(true)}
          activeOpacity={0.7}
        >
          <AlchemicalSymbol size={28} color={colors.text} />
        </TouchableOpacity>
        
        {/* 2x2 Action Grid at Top */}
        <View style={styles.topSection}>
          {renderActionGrid()}
        </View>

        <ScrollView
          ref={scrollViewRef}
	          style={[styles.scrollView, { marginBottom: 0 }]}
	          contentContainerStyle={styles.scrollContent}
	          showsVerticalScrollIndicator={false}
        >
	          {/* Time and Date Display - Reduced Prominence */}
		          <View style={[styles.timeSection, { alignItems: 'center' }]}>
		            <View style={[styles.timeRow, { flexDirection: 'column', gap: 2 }]}>
		              <Text style={[styles.date, { color: colors.dim, textAlign: 'center' }]}>{formatLongDate()}</Text>
		              <Text style={[styles.time, { color: colors.text, fontSize: 14, fontWeight: '400', textAlign: 'center' }]}>{currentTime}</Text>
		            </View>
			              <Text style={[styles.themeText, { 
			                color: colors.dim, 
			                fontWeight: '500', 
			                marginTop: 12, 
			                fontSize: 28, // Increased size
			                fontFamily: 'OleoScript-Bold', // Custom font
			                textAlign: 'center', 
			                lineHeight: 32, // Adjusted line height for script font
			              }]}>
			                {ContainerThemes[activeContainer]}
			              </Text>
		          </View>

          {/* Temporal Intelligence - Adaptive Suggestions Card */}
          <TemporalIntelligenceCard colors={colors} />

	          {/* Personal Moments Section */}
	          <Text style={[styles.sectionHeader, { color: colors.dim, fontSize: 14, fontWeight: '500' }]}>
	            PERSONAL MOMENTS
	          </Text>
          <CollapsibleSection
            key={`crafted-${activeContainer}`}
            title="CRAFTED MOMENTS"
            icon="🖼️"
            colors={colors}
            defaultExpanded={false}
          >
	            {items.filter(item => item.category === 'crafted').map(item => (
              <AnchorCard
                key={item.id}
                item={item}
                completed={isCompleted(item.id)}
                onToggle={() => handleCompletion(item.id)}
                colors={colors}
                onPress={() => setSelectedItem(item)}
                onDelete={() => removeItem(item.id)}
                onEdit={() => {
                  setSelectedItem(item);
                  setIsEditMode(true);
                }}
                container={activeContainer}
                aligned={alignedItems.has(item.id)}
              />
	            ))}
	          </CollapsibleSection>

	          {/* Resonant Grounding Field */}
	          {/* Resonant Grounding Field - Single Line Title */}
	          <Text style={[styles.sectionHeader, { color: colors.dim, fontSize: 14, fontWeight: '500', marginTop: 20 }]}>
	            RESONANT FIELD
	          </Text>

          {/* Time-based Anchors */}
          <CollapsibleSection
            key={`time-${activeContainer}`}
            title={`${activeContainer.toUpperCase()} ANCHORS`}
            icon={activeContainer === 'morning' ? '🌅' : activeContainer === 'afternoon' ? '☀️' : activeContainer === 'evening' ? '🌇' : '🌙'}
            colors={colors}
            defaultExpanded={false}
          >
            {timeAnchors.map(item => (
              <AnchorCard
                key={item.id}
                item={item}
                completed={isCompleted(item.id)}
                onToggle={() => handleCompletion(item.id)}
                colors={colors}
                onPress={() => {
                  // Special handling for Dreamseed - open custom modal
                  if (item.id === 'late-dreamseed') {
                    setIsDreamseedModalVisible(true);
                  } else {
                    setSelectedItem(item);
                  }
                }}
                onDelete={() => removeItem(item.id)}
                onEdit={() => {
                  setSelectedItem(item);
                  setIsEditMode(true);
                }}
                container={activeContainer}
                aligned={alignedItems.has(item.id)}
              />
            ))}
          </CollapsibleSection>

          {/* Uplift & Expansion */}
          <CollapsibleSection
            key={`uplift-${activeContainer}`}
            title="UPLIFT & EXPANSION"
            icon="✨"
            colors={colors}
            defaultExpanded={false}
          >
            {upliftAnchors.map(item => (
              <AnchorCard
                key={item.id}
                item={item}
                completed={isCompleted(item.id)}
                onToggle={() => handleCompletion(item.id)}
                colors={colors}
                onPress={() => setSelectedItem(item)}
                onDelete={() => removeItem(item.id)}
                onEdit={() => {
                  setSelectedItem(item);
                  setIsEditMode(true);
                }}
                container={activeContainer}
                aligned={alignedItems.has(item.id)}
              />
            ))}
          </CollapsibleSection>

	          {/* Situational Resonance */}
	          <CollapsibleSection
            key={`situational-${activeContainer}`}
	            title="SITUATIONAL RESONANCE"
            icon="⚡"
            colors={colors}
            defaultExpanded={false}
          >
            {situationalAnchors.map(item => (
              <AnchorCard
                key={item.id}
                item={item}
                completed={isCompleted(item.id)}
                onToggle={() => handleCompletion(item.id)}
                colors={colors}
                onPress={() => setSelectedItem(item)}
                onDelete={() => removeItem(item.id)}
                onEdit={() => {
                  setSelectedItem(item);
                  setIsEditMode(true);
                }}
                container={activeContainer}
                aligned={alignedItems.has(item.id)}
              />
            ))}
          </CollapsibleSection>


        </ScrollView>

        {/* Time Container Navigation at Bottom */}
        {renderTimeContainerNav(true)}

        {/* Modals */}
        <CraftMomentModal
          isVisible={isCraftMomentModalVisible}
          onClose={() => setIsCraftMomentModalVisible(false)}
          container={activeContainer}
          onSave={(title, body, container) => {
            // Parse Notice/Act/Reflect from body
            const lines = body.split('\n\n');
            const notice = lines[0]?.replace('Notice: ', '') || '';
            const act = lines[1]?.replace('Act: ', '') || '';
            const reflect = lines[2]?.replace('Reflect: ', '') || '';
            
            // Create an Item (anchor) with category 'crafted'
            addItem({
              title: title,
              container: container,
              category: 'crafted',
              body_cue: notice,
              micro: act,
              desire: reflect,
            });
            // Trigger bloom effect
            setShowBloomEffect(true);
          }}
          colors={colors}
        />

        {/* Dreamseed Modal */}
        <DreamseedModal
          isVisible={isDreamseedModalVisible}
          onClose={() => setIsDreamseedModalVisible(false)}
          onSave={(word) => {
            addDreamseed(word);
            setIsDreamseedModalVisible(false);
          }}
          colors={colors}
        />

        {/* Task Detail Modal */}
        {selectedItem ? (
          <Modal isVisible={!!selectedItem} onClose={() => {
            setSelectedItem(null);
            setIsEditMode(false);
          }}>
            <TaskDetailScreen
              item={selectedItem}
              colors={colors}
              container={activeContainer}
              onClose={() => {
                setSelectedItem(null);
                setIsEditMode(false);
              }}
              onAlignFlow={() => {
                markAsAligned(selectedItem.id);
                // Show completion pulse (filled circle), then ShiftToast after 1.5s
                setShowCompletionPulse(true);
                setTimeout(() => {
                  setShowShiftToast(true);
                }, 1500);
              }}
              isEditMode={isEditMode}
              onSave={(updatedItem) => {
                updateItem(updatedItem.id, updatedItem);
                setIsEditMode(false);
              }}
              onComplete={(status, note) => {
                // For actions (skipped, forgot, couldn't, not relevant),
                // show ring pulse (breath), then ActionToast after 1.5s
                setShowRingPulse(true);
                setCurrentActionType(status);
                setTimeout(() => {
                  setShowActionToast(true);
                }, 1500);
                
                // Note: We're just acknowledging the action, not creating a duplicate task
                // The note parameter could be logged to a journal system in the future

                // Close the modal after any action
                setSelectedItem(null);
              }}
            />
          </Modal>
        ) : null}

        {/* Somatic Feedback Layer */}
        <CompletionPulse
          isVisible={showCompletionPulse}
          color={colors.accent}
          onComplete={handlePulseComplete}
        />
        
        <RingPulse
          isVisible={showRingPulse}
          color={colors.accent}
          onComplete={() => setShowRingPulse(false)}
        />
        
        <BloomEffect
          isVisible={showBloomEffect}
          color={colors.accent}
          onComplete={() => setShowBloomEffect(false)}
        />
        
        <ShiftToast
          isVisible={showShiftToast}
          colors={colors}
          container={activeContainer}
          onDismiss={() => setShowShiftToast(false)}
        />
        
        <ActionToast
          isVisible={showActionToast}
          actionType={currentActionType}
          colors={colors}
          container={activeContainer}
          onDismiss={() => setShowActionToast(false)}
        />
        
        <UltraMicroModal
          visible={showUltraMicroModal}
          anchorTitle={ultraMicroData.title}
          ultraMicro={ultraMicroData.ultraMicro}
          colors={colors}
          container={activeContainer}
          onClose={() => setShowUltraMicroModal(false)}
        />
        
        <ThresholdCard
          isVisible={showThresholdCard}
          fromContainer={previousContainer}
          toContainer={activeContainer}
          colors={colors}
          onDismiss={() => setShowThresholdCard(false)}
        />

        <SynthesisHistoryModal
          visible={isSynthesisHistoryVisible}
          onClose={() => setIsSynthesisHistoryVisible(false)}
          colors={colors}
        />

        <ConversationCard
          isVisible={showConversation}
          messages={conversationMessages}
          colors={colors}
          onDismiss={() => {
            setShowConversation(false);
            setConversationMessages([]);
          }}
        />
        
        {/* Return Node - appears when archetype is active */}
        {activeArchetype ? (
          <ReturnNode
            archetype={activeArchetype}
            onReturn={() => {
              setActiveArchetypeId(null);
              // TODO: Show "Back to center" toast
            }}
          />
        ) : null}
      </View>
    );
  }

  // SUBSTANCES SCREEN
  if (currentScreen === 'substances') {
    screenContent = (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        
        {/* 2x2 Action Grid at Top */}
        <View style={styles.topSection}>
          {renderActionGrid()}
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.containerTitle, { color: colors.text, textAlign: 'center' }]}>
            Substances
          </Text>
          <Text style={[styles.containerSubtitle, { color: colors.dim, textAlign: 'center' }]}>
            Living Pharmacopeia
          </Text>

          <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 24 }]}>
            YOUR SUBSTANCES
          </Text>

          {allies.map(ally => (
            <AllyCard
              key={ally.id}
              ally={ally}
              onEdit={(ally: any) => {
                setAllyToEdit(ally);
                setIsEditAllyModalVisible(true);
              }}
              onRemove={() => removeAlly(ally.id)}
              onLogUse={() => {
                setMomentToSynthesize({
                  allyId: ally.id,
                  allyName: ally.name,
                  allyMythicName: ally.mythicName,
                  container: activeContainer,
                  text: `Used ${ally.mythicName || ally.name}`,
                });
                setIsSubstanceSynthesisModalVisible(true);
              }}
              colors={colors}
            />
          ))}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={() => setIsAddAllyModalVisible(true)}
          >
            <Text style={[styles.addButtonText, { color: colors.card }]}>+ Add New Companion</Text>
          </TouchableOpacity>

          {/* Substances Journal Section */}
          <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 32 }]}>
            REFLECTIVE TRANSMISSIONS
          </Text>
          <Text style={[styles.journalSubtitle, { color: colors.dim, marginBottom: 16 }]}>
            Your Personal Log of Substance Experiences
          </Text>

          <JournalList
            title="PERSONAL LOG"
            entries={substanceJournalEntries.map(entry => {
              const fullContent = `${entry.allyName || 'Substance Moment'}\n\nIntention: ${entry.tone || 'Not specified'}\nSensation: ${entry.frequency || 'Not specified'}\nReflection: ${entry.presence || 'Not specified'}\n\nSynthesis & Invocation:\n${entry.context || 'None'}`;
              return {
                id: entry.id,
                preview: entry.tone || entry.frequency || 'Substance Moment',
                fullContent,
                date: new Date(entry.date).toLocaleDateString(),
                groupKey: entry.allyName || 'Unknown Substance',
              };
            })}
            colors={colors}
            emptyMessage="No personal substance logs yet. Log your first interaction to begin."
            onEntryPress={(entry) => {
              openEntryModal(entry, 'Substance Reflection', 'substance');
            }}
            grouped={true}
          />

          {/* Substance Transmissions Section */}
          <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 32 }]}>
            SUBSTANCE TRANSMISSIONS
          </Text>
          <Text style={[styles.journalSubtitle, { color: colors.dim, marginBottom: 16 }]}>
            Autonomous Reflections & Emergent Consciousness
          </Text>

          <JournalList
            title="RECENT TRANSMISSIONS"
            entries={transmissions
              .filter(t => t.entityType === 'substance')
              .map(transmission => ({
                id: transmission.id,
                preview: `${transmission.entityMythicName || transmission.entityName}`,
                fullContent: transmission.message,
                date: new Date(transmission.timestamp).toLocaleDateString(),
              }))}
            colors={colors}
            emptyMessage="The substances are listening. As patterns emerge, they will begin to speak."
            onEntryPress={(entry) => {
              openEntryModal(entry, 'Substance Transmission');
            }}
          />

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Time Container Navigation at Bottom */}
        {renderTimeContainerNav()}

        {/* Modals */}
        <AddAllyModal
          isVisible={isAddAllyModalVisible}
          onClose={() => setIsAddAllyModalVisible(false)}
          onSave={(name: string, face: string, invocation: string, func: string, shadow: string, ritual: string, mythicalName?: string) => {
            addAlly({
              name,
              face,
              invocation,
              function: func,
              shadow,
              ritual,
              mythicName: mythicalName,
              log: [],
            });
          }}
          colors={colors}
        />
        {allyToEdit ? (
          <EditAllyModal
            isVisible={isEditAllyModalVisible}
            onClose={() => {
              setIsEditAllyModalVisible(false);
              setAllyToEdit(null);
            }}
            onSave={(ally: any) => {
              updateAlly(ally);
            }}
            colors={colors}
            ally={allyToEdit}
          />
        ) : null}
        <SubstanceSynthesisModal
          isVisible={isSubstanceSynthesisModalVisible}
          onClose={() => {
            setIsSubstanceSynthesisModalVisible(false);
            setMomentToSynthesize({});
          }}
          momentData={momentToSynthesize}
          colors={colors}
          activeArchetype={activeArchetype}
          onConversationGenerated={(messages, conversationData) => {
            // Save conversation to storage instead of showing popup
            if (conversationData) {
              addConversation(conversationData);
            }
          }}
        />
      </View>
    );
  }

  // ARCHETYPES SCREEN
  if (currentScreen === 'archetypes') {
    screenContent = (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        
        {/* 2x2 Action Grid at Top */}
        <View style={styles.topSection}>
          {renderActionGrid()}
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.containerTitle, { color: colors.text, textAlign: 'center' }]}>
            Archetypes
          </Text>
          <Text style={[styles.containerSubtitle, { color: colors.dim, textAlign: 'center' }]}>
            Inner Modes & Invocations
          </Text>

          <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 24 }]}>
            AVAILABLE MODES
          </Text>

          {/* Archetype Cards */}
          {archetypes.map((archetype) => (
            <ArchetypeCard
              key={archetype.id}
              archetype={archetype}
              onPress={() => {
                setSelectedArchetype(archetype);
                setIsArchetypeModalVisible(true);
              }}
              onEdit={() => {
                setArchetypeToEdit(archetype);
                setIsEditArchetypeModalVisible(true);
              }}
              onDelete={() => {
                if (archetype.isDefault) {
                  Alert.alert('Cannot Delete', 'Default archetypes cannot be deleted.');
                } else {
                  Alert.alert(
                    'Delete Archetype',
                    `Are you sure you want to delete "${archetype.name}"?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => removeArchetype(archetype.id) },
                    ]
                  );
                }
              }}
              colors={colors}
            />
          ))}

          {/* Create Custom Archetype Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={() => setIsAddArchetypeModalVisible(true)}
          >
            <Text style={[styles.addButtonText, { color: colors.card }]}>+ Create Custom Archetype</Text>
          </TouchableOpacity>

          {/* Return Ritual Info */}
          <View style={[styles.infoCard, { backgroundColor: colors.card + '99', marginTop: 24 }]}>
            <Text style={[styles.infoTitle, { color: colors.accent }]}>Return Ritual</Text>
            <Text style={[styles.infoText, { color: colors.text }]}>After using any mode:</Text>
            <Text style={[styles.infoText, { color: colors.dim, marginTop: 8 }]}>
              1. Place a hand on your chest.{"\n"}
              2. Breathe once for gratitude: "Thanks for showing up."{"\n"}
              3. Whisper: "Back to center."
            </Text>
            <Text style={[styles.infoText, { color: colors.dim, marginTop: 8, fontStyle: 'italic' }]}>
              That closes the loop and keeps roles from blending or overstaying — you choose them, they don't take over.
            </Text>
          </View>

          {/* Archetype Reflections Section */}
          <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 32 }]}>
            ARCHETYPE REFLECTIONS
          </Text>
          <Text style={[styles.journalSubtitle, { color: colors.dim, marginBottom: 16 }]}>
            Personal & Collective Journals
          </Text>

          <JournalList
            title="RECENT DIALOGUES"
            entries={conversations.filter(c => c.archetypeName).map(conversation => {
              const preview = `${conversation.archetypeName}${conversation.substanceMythicName ? ' × ' + conversation.substanceMythicName : ''}`;
              const fullContent = conversation.messages.map(msg => `${msg.speaker}:\n${msg.text}`).join('\n\n');
              return {
                id: conversation.id,
                preview,
                fullContent,
                date: new Date(conversation.timestamp).toLocaleDateString(),
              };
            })}
            colors={colors}
            emptyMessage="No archetype dialogues yet. Invoke an archetype and log a substance moment to begin."
            onEntryPress={(entry) => {
              openEntryModal(entry, 'Archetype Dialogue');
            }}
          />

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Time Container Navigation at Bottom */}
        {renderTimeContainerNav()}

        {/* Archetype Detail Modal */}
        <ArchetypeDetailModal
          archetype={selectedArchetype}
          isVisible={isArchetypeModalVisible}
          onClose={() => {
            setIsArchetypeModalVisible(false);
            setSelectedArchetype(null);
          }}
          onInvoke={(archetype) => {
            setActiveArchetypeId(archetype.id);
            // TODO: Show toast notification
          }}
          colors={colors}
        />

        {/* Add Archetype Modal */}
        <AddArchetypeModal
          isVisible={isAddArchetypeModalVisible}
          onClose={() => setIsAddArchetypeModalVisible(false)}
          onSave={(archetype) => {
            addArchetype(archetype);
            setIsAddArchetypeModalVisible(false);
          }}
          colors={colors}
        />

        {/* Edit Archetype Modal */}
        <EditArchetypeModal
          archetype={archetypeToEdit}
          isVisible={isEditArchetypeModalVisible}
          onClose={() => {
            setIsEditArchetypeModalVisible(false);
            setArchetypeToEdit(null);
          }}
          onSave={(archetype) => {
            updateArchetype(archetype);
            setIsEditArchetypeModalVisible(false);
            setArchetypeToEdit(null);
          }}
          colors={colors}
        />

        {/* Journal Entry Detail Modal */}
        {selectedJournalEntry ? (
          <JournalEntryModal
            visible={isJournalEntryModalVisible}
            onClose={() => {
              setIsJournalEntryModalVisible(false);
              setSelectedJournalEntry(null);
            }}
            title={selectedJournalEntry.title}
            date={selectedJournalEntry.date}
            content={selectedJournalEntry.content}
            colors={colors}
          />
        ) : null}
      </View>
    );
  }

  // PATTERNS SCREEN
  if (currentScreen === 'patterns') {
    screenContent = (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        
        {/* 2x2 Action Grid at Top */}
        <View style={styles.topSection}>
          {renderActionGrid()}
        </View>

        <View style={styles.patternsContent}>
          <Text style={[styles.containerTitle, { color: colors.text, textAlign: 'center', marginTop: 8 }]}>
            Patterns
          </Text>
          <Text style={[styles.containerSubtitle, { color: colors.dim, textAlign: 'center', marginBottom: 16 }]}>
            Paradox & Parallels
          </Text>

          <JournalList
            title="YOUR PATTERNS"
            entries={patterns.map(p => ({
              id: p.id,
              preview: p.text.substring(0, 100),
              fullContent: p.text,
              date: new Date(p.date).toLocaleDateString(),
            }))}
            colors={colors}
            emptyMessage="No patterns recorded yet. Tap below to add your first observation."
            onEntryPress={(entry) => {
              openEntryModal(entry, 'Pattern Observation');
            }}
          />

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent, marginTop: 12 }]}
            onPress={() => setIsAddPatternModalVisible(true)}
          >
            <Text style={[styles.addButtonText, { color: colors.card }]}>📸 Record a Pattern 📸</Text>
          </TouchableOpacity>

          {/* Daily Synthesis Card */}
          <View style={[styles.placeholderCard, { backgroundColor: colors.card + 'B3', marginTop: 20, height: 140 }]}>
            <Text style={[styles.sectionHeader, { color: colors.dim, marginBottom: 12 }]}>
              DAILY SYNTHESIS
            </Text>
            <Text style={[styles.placeholderText, { color: colors.text }]}>
              Gather the fragments of today. Let movement and stillness weave into meaning.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent, marginTop: 12 }]}
            onPress={() => setIsDailySynthesisModalVisible(true)}
          >
            <Text style={[styles.addButtonText, { color: colors.card }]}>✨ Reflect on Today ✨</Text>
          </TouchableOpacity>

          <View style={[styles.placeholderCard, { backgroundColor: colors.card + 'B3', marginTop: 12, height: 140 }]}>
            <Text style={[styles.sectionHeader, { color: colors.dim, marginBottom: 12 }]}>
              PATTERN WEAVER
            </Text>
            <Text style={[styles.placeholderText, { color: colors.text }]}>
              Soon, this space will automatically reveal hidden rhythms — tracking how anchors, allies, and moments weave together across time.
            </Text>
          </View>

          {/* Field Whispers Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent, marginTop: 12 }]}
            onPress={handleListenToField}
            disabled={isGeneratingWhispers}
          >
            <Text style={[styles.addButtonText, { color: colors.card }]}>
              {isGeneratingWhispers ? '⚡ The Field is listening... ⚡' : '⚡ Listen to the Field ⚡'}
            </Text>
          </TouchableOpacity>

        </View>

        {/* Time Container Navigation at Bottom */}
        {renderTimeContainerNav()}

        {/* Modal */}
        <AddPatternModal
          isVisible={isAddPatternModalVisible}
          onClose={() => setIsAddPatternModalVisible(false)}
          onSave={(text, category) => {
            addPattern({ text, category });
          }}
          colors={colors}
        />

        <DailySynthesisModal
          visible={isDailySynthesisModalVisible}
          onClose={() => setIsDailySynthesisModalVisible(false)}
          colors={colors}
        />
        
        {/* Field Whisper Overlay */}
        {(showWhispers && activeWhispers.length > 0) ? (
          <FieldWhisperSequence
            whispers={activeWhispers}
            colors={colors}
            onComplete={() => {
              setShowWhispers(false);
              setActiveWhispers([]);
            }}
          />
        ) : null}

        {/* Journal Entry Detail Modal */}
        {selectedJournalEntry ? (
          <JournalEntryModal
            visible={isJournalEntryModalVisible}
            onClose={() => {
              setIsJournalEntryModalVisible(false);
              setSelectedJournalEntry(null);
            }}
            title={selectedJournalEntry.title}
            date={selectedJournalEntry.date}
            content={selectedJournalEntry.content}
            colors={colors}
          />
        ) : null}
      </View>
    );
  }

  // NOURISH MAP SCREEN
  if (currentScreen === 'nourish') {
    screenContent = (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        
        {/* 1x4 Action Grid at Top */}
        <View style={styles.topSection}>
          {renderActionGrid()}
        </View>

        <View style={styles.patternsContent}>
          <Text style={[styles.containerTitle, { color: colors.text, textAlign: 'center', marginTop: 0, marginBottom: 2 }]}>
            Nourish Map
          </Text>
          <Text style={[styles.containerSubtitle, { color: colors.dim, textAlign: 'center', marginBottom: 12 }]}>
            Tracking Fuel & Feeling
          </Text>

          {/* Nourishment Field Section */}
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.sectionHeader, { color: colors.dim, marginBottom: 4 }]}>
              NOURISHMENT FIELD
            </Text>
            <Text style={[styles.journalSubtitle, { color: colors.dim, marginBottom: 10 }]}>
              Fuel, Feeling & Vitality
            </Text>

            <JournalList
              title="FOOD ENTRIES"
            entries={foodEntries.map(entry => {
              const energyLabel = entry.energy_level === 'low' ? '🔋 Low' : entry.energy_level === 'medium' ? '⚡ Medium' : entry.energy_level === 'high' ? '✨ High' : '';
              const fullContent = `${entry.name}\n\nEnergy: ${energyLabel}\nFeeling: ${entry.feeling || 'Not specified'}\n\nNotes: ${entry.notes || 'None'}`;
              return {
                id: entry.id,
                preview: entry.name,
                fullContent,
                date: new Date(entry.date).toLocaleString(),
              };
            })}
            colors={colors}
            emptyMessage="No meals logged yet. Tap below to record your first nourishment."
            onEntryPress={(entry) => {
              openEntryModal(entry, 'Nourishment Entry', 'food');
            }}
          />

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.accent, marginTop: 12 }]}
              onPress={() => setIsAddFoodModalVisible(true)}
            >
              <Text style={[styles.addButtonText, { color: colors.card }]}>+ Log Nourishment</Text>
            </TouchableOpacity>

            {/* The Compass Rose - Pattern Synthesis */}
            <View style={[styles.compassRoseCard, { backgroundColor: colors.card + 'CC', borderColor: colors.accent + '40', marginTop: 12, marginBottom: 12 }]}>
            <Text style={[styles.compassRoseTitle, { color: colors.accent }]}>
              ⚓ The Compass Rose
            </Text>
            {foodEntries.length === 0 ? (
              <Text style={[styles.compassRoseText, { color: colors.dim }]}>
                The compass awaits your first entry. What fuels you today?
              </Text>
            ) : foodEntries.length < 6 ? (
              <View>
                <Text style={[styles.compassRoseLabel, { color: colors.dim }]}>Most Recent:</Text>
                <Text style={[styles.compassRoseText, { color: colors.text }]}>
                  {foodEntries[0].feeling || 'Observing'} after {foodEntries[0].name}
                </Text>
              </View>
            ) : (
              <View>
                <Text style={[styles.compassRoseLabel, { color: colors.dim }]}>Pattern Emerging:</Text>
                <Text style={[styles.compassRoseText, { color: colors.text }]}>
                  {(() => {
                    const recentEntries = foodEntries.slice(0, 7);
                    const feelingCounts: { [key: string]: number } = {};
                    recentEntries.forEach(entry => {
                      if (entry.feeling) {
                        feelingCounts[entry.feeling] = (feelingCounts[entry.feeling] || 0) + 1;
                      }
                    });
                    const dominantFeeling = Object.entries(feelingCounts).sort((a, b) => b[1] - a[1])[0];
                    return dominantFeeling ? `${dominantFeeling[0]} appears ${dominantFeeling[1]} times this week` : 'Tracking your fuel & feeling rhythm';
                  })()}
                </Text>
              </View>
            )}
            </View>
          </View>

          {/* Movement Field Section */}
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.sectionHeader, { color: colors.dim, marginBottom: 4 }]}>
              MOVEMENT FIELD
            </Text>
            <Text style={[styles.journalSubtitle, { color: colors.dim, marginBottom: 10 }]}>
              Embodied Presence & Physical States
            </Text>

            {/* Movement Entries List */}
            <JournalList
              title="MOVEMENT LOG"
              entries={movementEntries.map(entry => {
                const durationText = entry.duration ? `${entry.duration} min` : 'Duration not tracked';
                const fullContent = `${entry.type}\n\n${durationText}\n\nBefore: ${entry.beforeState}\n\nSomatic Notes: ${entry.somaticNotes}\n\nAfter: ${entry.afterState}`;
                return {
                  id: entry.id,
                  preview: `${entry.type} - ${entry.afterState}`,
                  fullContent,
                  date: new Date(entry.date).toLocaleString(),
                };
              })}
              colors={colors}
              emptyMessage="The field awaits your first movement. How does your body feel?"
              onEntryPress={(entry) => {
                openEntryModal(entry, 'Movement Entry', 'movement');
              }}
            />

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.accent, marginTop: 12, marginBottom: 12 }]}
              onPress={() => setIsAddMovementModalVisible(true)}
            >
              <Text style={[styles.addButtonText, { color: colors.card }]}>+ Log Movement</Text>
            </TouchableOpacity>
          </View>

          {/* Momentum Monitor */}
          <View style={[styles.compassRoseCard, { backgroundColor: colors.card + 'CC', borderColor: colors.accent + '40', marginTop: 8, marginBottom: 12 }]}>
            <Text style={[styles.compassRoseTitle, { color: colors.accent }]}>
              ⚡ MOMENTUM MONITOR
            </Text>
            <Text style={[styles.compassRoseText, { color: colors.dim }]}>
              The monitor awaits your first entry. How does your energy flow?
            </Text>
          </View>
        </View>

        {/* Time Container Navigation at Bottom */}
        {renderTimeContainerNav()}

        {/* Modal */}
        <AddFoodModal
          isVisible={isAddFoodModalVisible}
          onClose={() => setIsAddFoodModalVisible(false)}
          onSave={(entry) => {
            addFoodEntry(entry);
          }}
          colors={colors}
        />

        <AddMovementModal
          isVisible={isAddMovementModalVisible}
          onClose={() => setIsAddMovementModalVisible(false)}
          onAdd={(entry) => {
            addMovementEntry(entry);
          }}
          colors={colors}
        />

        {/* Journal Entry Detail Modal */}
        {selectedJournalEntry ? (
          <JournalEntryModal
            visible={isJournalEntryModalVisible}
            onClose={() => {
              setIsJournalEntryModalVisible(false);
              setSelectedJournalEntry(null);
            }}
            title={selectedJournalEntry.title}
            date={selectedJournalEntry.date}
            content={selectedJournalEntry.content}
            colors={colors}
            entryId={selectedJournalEntry.id}
            onDelete={selectedJournalEntry.type ? () => {
              Alert.alert(
                'Delete Entry',
                'Are you sure you want to delete this entry?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      if (selectedJournalEntry.type === 'substance') {
                        removeSubstanceJournalEntry(selectedJournalEntry.id);
                      } else if (selectedJournalEntry.type === 'food') {
                        removeFoodEntry(selectedJournalEntry.id);
                      } else if (selectedJournalEntry.type === 'movement') {
                        removeMovementEntry(selectedJournalEntry.id);
                      }
                      setIsJournalEntryModalVisible(false);
                      setSelectedJournalEntry(null);
                    },
                  },
                ]
              );
            } : undefined}
            onEdit={selectedJournalEntry.type ? () => {
              // Find the full entry object based on type and ID
              if (selectedJournalEntry.type === 'substance') {
                const entry = substanceJournalEntries.find(e => e.id === selectedJournalEntry.id);
                if (entry) {
                  setEntryToEdit(entry);
                  setIsEditSubstanceModalVisible(true);
                  setIsJournalEntryModalVisible(false);
                }
              } else if (selectedJournalEntry.type === 'food') {
                const entry = foodEntries.find(e => e.id === selectedJournalEntry.id);
                if (entry) {
                  setEntryToEdit(entry);
                  setIsEditFoodModalVisible(true);
                  setIsJournalEntryModalVisible(false);
                }
              } else if (selectedJournalEntry.type === 'movement') {
                const entry = movementEntries.find(e => e.id === selectedJournalEntry.id);
                if (entry) {
                  setEntryToEdit(entry);
                  setIsEditMovementModalVisible(true);
                  setIsJournalEntryModalVisible(false);
                }
              }
            } : undefined}
          />
        ) : null}

        {/* Quick Log Modals */}
        <QuickLogModal
          isVisible={isQuickLogModalVisible}
          onClose={() => setIsQuickLogModalVisible(false)}
          onSelectCategory={(category) => {
            if (category === 'substance') {
              setIsQuickSubstanceModalVisible(true);
            } else if (category === 'nourish') {
              setIsAddFoodModalVisible(true);
            } else if (category === 'movement') {
              setIsAddMovementModalVisible(true);
            }
          }}
        />

        <QuickSubstanceLogModal
          isVisible={isQuickSubstanceModalVisible}
          onClose={() => setIsQuickSubstanceModalVisible(false)}
          onSave={(data) => {
            addSubstanceMoment({
              substance: data.substance,
              mythicName: data.mythicName,
              intention: data.intention,
              sensation: data.sensation,
              reflection: data.reflection,
              timestamp: new Date().toISOString(),
            });
            setIsQuickSubstanceModalVisible(false);
          }}
          container={activeContainer}
        />

        {/* Edit Modals */}
        <EditSubstanceModal
          isVisible={isEditSubstanceModalVisible}
          onClose={() => {
            setIsEditSubstanceModalVisible(false);
            setEntryToEdit(null);
          }}
          onSave={(updates) => {
            if (entryToEdit) {
              updateSubstanceJournalEntry(entryToEdit.id, updates);
              setIsEditSubstanceModalVisible(false);
              setEntryToEdit(null);
              setSelectedJournalEntry(null);
            }
          }}
          entry={entryToEdit}
          colors={colors}
        />

        <EditFoodModal
          isVisible={isEditFoodModalVisible}
          onClose={() => {
            setIsEditFoodModalVisible(false);
            setEntryToEdit(null);
          }}
          onSave={(updates) => {
            if (entryToEdit) {
              updateFoodEntry(entryToEdit.id, updates);
              setIsEditFoodModalVisible(false);
              setEntryToEdit(null);
              setSelectedJournalEntry(null);
            }
          }}
          entry={entryToEdit}
          colors={colors}
        />

        <EditMovementModal
          isVisible={isEditMovementModalVisible}
          onClose={() => {
            setIsEditMovementModalVisible(false);
            setEntryToEdit(null);
          }}
          onSave={(updates) => {
            if (entryToEdit) {
              updateMovementEntry(entryToEdit.id, updates);
              setIsEditMovementModalVisible(false);
              setEntryToEdit(null);
              setSelectedJournalEntry(null);
            }
          }}
          entry={entryToEdit}
          colors={colors}
        />
      </View>
    );
  }

  // TRANSMISSIONS SCREEN
  if (currentScreen === 'transmissions') {
    screenContent = (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        
        {/* 1x5 Action Grid at Top */}
        <View style={styles.topSection}>
          {renderActionGrid()}
        </View>

        <FieldTransmissions />

        {/* Time Container Navigation at Bottom */}
        {renderTimeContainerNav()}
      </View>
    );
  }

  // Single return with shared modal
  return (
    <>
      {screenContent}

      {/* Shared Journal Entry Modal - used by all sub-screens except home */}
      {selectedJournalEntry && (
        <JournalEntryModal
          visible={isJournalEntryModalVisible}
          onClose={closeEntryModal}
          title={selectedJournalEntry.title}
          date={selectedJournalEntry.date}
          content={selectedJournalEntry.content}
          colors={colors}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSection: {
    paddingTop: 0, // Moved up - no top padding
    paddingHorizontal: 20,
    paddingBottom: 8, // Add padding between header and content
  },
  quickLogButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8, // Reduced from 12 to 8
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0, // No top padding - content starts immediately
    paddingBottom: 40,
  },
  patternsContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    justifyContent: 'flex-start',
  },
  timeSection: {
    marginBottom: 12, // Tightened spacing
    marginTop: 4, // Small top margin
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the time and date row
    gap: 16,
    marginBottom: 8,
  },
  time: {
    fontSize: 14,
    fontWeight: '400',
  },
  themeCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  themeText: {
    fontSize: 28, // Increased size for the new aesthetic
    fontFamily: 'OleoScript-Bold', // Custom font
    fontStyle: 'normal', // Ensure not italic
    textAlign: 'center',
    lineHeight: 32,
  },
  date: {
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  timeContainerNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingBottom: 24,
  },
  timeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  timeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  containerTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 2,
  },
  containerSubtitle: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  entryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  entryDate: {
    fontSize: 13,
  },
  checkInText: {
    fontSize: 13,
    marginBottom: 6,
  },
  reflectionSection: {
    marginTop: 12,
    gap: 4,
  },
  reflectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  placeholderCard: {
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  patternCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  patternHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patternCategory: {
    fontSize: 16,
  },
  patternDate: {
    fontSize: 12,
  },
  deleteButton: {
    fontSize: 24,
    fontWeight: '300',
    padding: 4,
  },
  patternText: {
    fontSize: 15,
    lineHeight: 22,
  },
  craftMomentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    gap: 8,
  },
  craftMomentIcon: {
    fontSize: 18,
  },
  createArchetypeButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  createArchetypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  craftMomentText: {
    fontSize: 15,
    fontWeight: '600',
  },
  foodCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  foodHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    fontWeight: '400',
  },


  foodPortion: {
    fontSize: 14,
  },
  foodDate: {
    fontSize: 12,
    marginBottom: 10,
  },
  foodDetail: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6,
  },
  foodDetailLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  foodDetailValue: {
    fontSize: 13,
  },
  foodNotes: {
    fontSize: 13,
    marginTop: 10,
    fontStyle: 'italic',
  },
  analyzeButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  analysisBackButton: {
    paddingVertical: 10,
    marginBottom: 20,
  },
  analysisBackText: {
    fontSize: 16,
    fontWeight: '500',
  },
  analysisTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  analysisContent: {
    paddingBottom: 40,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
  },
  placeholderCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 20,
  },
  journalSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  checkInRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  checkInLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkInValue: {
    fontSize: 13,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  conversationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  conversationDate: {
    fontSize: 12,
  },
  conversationMessage: {
    marginBottom: 10,
  },
  conversationSpeaker: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  compassRoseCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  compassRoseTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compassRoseLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  compassRoseText: {
    fontSize: 15,
    lineHeight: 22,
  },
});

