import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated, Platform } from 'react-native';
import { ContainerItem, ColorScheme, ContainerId } from '../_constants/Types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  item: ContainerItem;
  colors: ColorScheme;
  container: ContainerId;
  onClose: () => void;
  onComplete: (status: 'skipped' | 'forgot' | 'couldn\'t' | 'not relevant', note: string) => void;
  onAlignFlow?: () => void; // Called when Align Flow is clicked
  isEditMode?: boolean;
  onSave?: (updatedItem: ContainerItem) => void;
}

// Proportional Scaling System (PSS)
const getCardScale = (container: ContainerId): number => {
  // Morning/Afternoon use 0.96 (−4%), Evening/Late use 1.0
  return (container === 'morning' || container === 'afternoon') ? 0.96 : 1.0;
};

const scaleValue = (baseValue: number, scale: number): number => {
  return Math.round(baseValue * scale);
};

// Get time-of-day responsive glow for boxes
const getTimeGlowStyle = (container: ContainerId) => {
  const glowStyles: Record<string, { backgroundColor: string; borderColor: string; shadowColor: string; labelColor: string }> = {
    morning: {
      backgroundColor: '#D4A57445', // Richer honey/amber tone (was pale #F5E6CC)
      borderColor: '#D4A57480', // Warmer, more saturated border
      shadowColor: '#D4A574',
      labelColor: '#B8864E', // Darker label for contrast
    },
    afternoon: {
      backgroundColor: '#5FA8B845', // Richer teal/aqua (was pale #B0E0E6)
      borderColor: '#5FA8B880', // More saturated border
      shadowColor: '#5FA8B8',
      labelColor: '#4A8A9A', // Darker for contrast
    },
    evening: {
      backgroundColor: '#8C4B3F48', // Increased from 30 to 48
      borderColor: '#8C4B3F85', // Increased from 65 to 85
      shadowColor: '#8C4B3F',
      labelColor: '#E8B4A8',
    },
    late: {
      backgroundColor: '#3A3F4545', // Increased from 28 to 45
      borderColor: '#3A3F4580', // Increased from 60 to 80
      shadowColor: '#3A3F45',
      labelColor: '#8B9DC3',
    },
  };

  return glowStyles[container] || glowStyles.morning;
};

// Dynamic font size based on character count
const getDynamicFontSize = (text: string, baseSize: number, baseLineHeight: number) => {
  const length = text.length;
  
  // Thresholds for font size reduction
  if (length < 50) {
    return { fontSize: baseSize, lineHeight: baseLineHeight };
  } else if (length < 80) {
    return { fontSize: baseSize - 1, lineHeight: baseLineHeight - 2 };
  } else if (length < 120) {
    return { fontSize: baseSize - 2, lineHeight: baseLineHeight - 3 };
  } else if (length < 160) {
    return { fontSize: baseSize - 3, lineHeight: baseLineHeight - 4 };
  } else {
    return { fontSize: baseSize - 4, lineHeight: baseLineHeight - 5 };
  }
};

export const TaskDetailScreen = ({ item, colors, container, onClose, onComplete, onAlignFlow, isEditMode = false, onSave }: Props) => {
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState('');
  const [editedTitle, setEditedTitle] = useState(item.title || '');
  const [editedNotice, setEditedNotice] = useState(item.body_cue || '');
  const [editedAct, setEditedAct] = useState(item.micro || '');
  const [editedReflect, setEditedReflect] = useState(item.desire || '');
  const [showCheckmark, setShowCheckmark] = useState(false);
  const allActionButtons = ['skipped', 'forgot', 'couldn\'t', 'not relevant'];
  const actionButtonLabels: Record<string, string> = {
    'skipped': 'Skipped',
    'forgot': 'Forgot',
    'couldn\'t': 'Couldn\'t',
    'not relevant': 'Not Relevant',
  };
  const actionButtons = allActionButtons.slice(0, (item as any).actionButtons || 4);
  
  // Breathing animation for action buttons
  const breathScale = useRef(new Animated.Value(1)).current;
  const breathOpacity = useRef(new Animated.Value(0.8)).current;
  
  // Shimmer removed - direct action on press
  
  // Reset Align Flow checkmark when time container changes
  useEffect(() => {
    setShowCheckmark(false);
  }, [container]);

  useEffect(() => {
    // Create continuous breathing animation with both scale and opacity
    const breathing = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(breathScale, {
            toValue: 1.05,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(breathScale, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(breathOpacity, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(breathOpacity, {
            toValue: 0.8,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, []);
  
  const timeGlow = getTimeGlowStyle(container);
  
  // PSS: Get scale for this container
  const cardScale = getCardScale(container);
  
  // PSS: Base typography tokens
  const fsTitle = scaleValue(18, cardScale);
  const fsLabel = scaleValue(11, cardScale);
  const fsBody = scaleValue(16, cardScale);
  const lhTight = 1.2;
  const lhBody = 1.35;
  const lsTight = -0.2;
  
  // PSS: Spacing tokens with breathing room
  const padY = scaleValue(14, cardScale);  // Increased for softer feel
  const padX = scaleValue(12, cardScale);
  const gap = scaleValue(12, cardScale);    // Increased for vertical breathing room
  const btnHeight = scaleValue(38, cardScale);
  const btnGap = scaleValue(8, cardScale);
  const alignFlowHeight = scaleValue(46, cardScale); // 20% taller than btnHeight for prominence

  // Get dynamic font sizes for each text field (still using dynamic sizing for long text)
  const noticeFontStyle = getDynamicFontSize(item.body_cue || '', fsBody, Math.round(fsBody * lhBody));
  const actFontStyle = getDynamicFontSize(item.micro || '', fsBody - 1, Math.round((fsBody - 1) * lhBody));
  const reflectFontStyle = getDynamicFontSize(item.desire || '', fsBody - 2, Math.round((fsBody - 2) * lhBody));

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {isEditMode ? (
        <TextInput
          style={[
            styles.title, 
            styles.titleInput, 
            { 
              color: colors.text, 
              textAlign: 'center', 
              borderColor: timeGlow.borderColor,
              fontSize: fsTitle,
              lineHeight: Math.round(fsTitle * lhTight),
              letterSpacing: lsTight,
            }
          ]}
          value={editedTitle}
          onChangeText={setEditedTitle}
          placeholder="Task title"
          placeholderTextColor={colors.dim}
        />
      ) : (
        <Text style={[
          styles.title, 
          { 
            color: colors.text, 
            textAlign: 'center',
            fontSize: fsTitle,
            lineHeight: Math.round(fsTitle * lhTight),
            letterSpacing: lsTight,
          }
        ]}>{item.title}</Text>
      )}

      <View style={styles.content}>
        {/* Notice Block with label inside */}
        <View style={[
          styles.glowBlock,
          styles.largeBlock,
          {
            backgroundColor: timeGlow.backgroundColor,
            borderColor: timeGlow.borderColor,
            shadowColor: timeGlow.shadowColor,
            marginTop: 8, // Push NOTICE box down from title
            marginBottom: gap, // PSS: Uniform gap based on scale
            padding: padY, // PSS: Scaled padding
          }
        ]}>
          <Text style={[
            styles.inlineLabel, 
            { 
              color: timeGlow.labelColor,
              fontSize: fsLabel,
              lineHeight: Math.round(fsLabel * lhTight),
              letterSpacing: 0.4, // Labels read better slightly expanded
            }
          ]}>NOTICE</Text>
          {isEditMode ? (
            <TextInput
              style={[
                styles.glowText,
                styles.editableText,
                {
                  color: colors.text,
                  fontSize: noticeFontStyle.fontSize,
                  lineHeight: noticeFontStyle.lineHeight,
                  fontWeight: '600',
                }
              ]}
              value={editedNotice}
              onChangeText={setEditedNotice}
              placeholder="Notice..."
              placeholderTextColor={colors.dim}
              multiline
            />
          ) : (
            <Text style={[
              styles.glowText,
              {
                color: colors.text,
                fontSize: noticeFontStyle.fontSize,
                lineHeight: noticeFontStyle.lineHeight,
                fontWeight: '600',
                letterSpacing: lsTight, // PSS: Compression before wrap
              }
            ]}>
              {item.body_cue || 'No notice provided'}
            </Text>
          )}
        </View>

        {/* Act Block with label inside */}
        <View style={[
          styles.glowBlock,
          styles.mediumBlock,
          {
            backgroundColor: timeGlow.backgroundColor,
            borderColor: timeGlow.borderColor,
            shadowColor: timeGlow.shadowColor,
            marginTop: 8, // Push ACT box down
            marginBottom: gap, // PSS: Uniform gap based on scale
            padding: padY, // PSS: Scaled padding
          }
        ]}>
          <Text style={[
            styles.inlineLabel, 
            { 
              color: timeGlow.labelColor,
              fontSize: fsLabel,
              lineHeight: Math.round(fsLabel * lhTight),
              letterSpacing: 0.4, // Labels read better slightly expanded
            }
          ]}>ACT</Text>
          {isEditMode ? (
            <TextInput
              style={[
                styles.glowText,
                styles.editableText,
                {
                  color: colors.text,
                  fontSize: actFontStyle.fontSize,
                  lineHeight: actFontStyle.lineHeight,
                  fontWeight: '500',
                }
              ]}
              value={editedAct}
              onChangeText={setEditedAct}
              placeholder="Act..."
              placeholderTextColor={colors.dim}
              multiline
            />
          ) : (
            <Text style={[
              styles.glowText,
              {
                color: colors.text,
                fontSize: actFontStyle.fontSize,
                lineHeight: actFontStyle.lineHeight,
                fontWeight: '500',
                letterSpacing: lsTight, // PSS: Compression before wrap
              }
            ]}>
              {item.micro || 'No action provided'}
            </Text>
          )}
        </View>
        
        {/* Reflect Block with label inside (if exists) */}
        {item.desire && (
          <View style={[
            styles.glowBlock,
            styles.smallBlock,
            {
              backgroundColor: timeGlow.backgroundColor,
              borderColor: timeGlow.borderColor,
              shadowColor: timeGlow.shadowColor,
              marginBottom: gap, // PSS: Uniform gap based on scale
              padding: padY, // PSS: Scaled padding
            }
          ]}>
            <Text style={[
            styles.inlineLabel, 
            { 
              color: timeGlow.labelColor,
              fontSize: fsLabel,
              lineHeight: Math.round(fsLabel * lhTight),
              letterSpacing: 0.4, // Labels read better slightly expanded
            }
          ]}>REFLECT</Text>
            {isEditMode ? (
              <TextInput
                style={[
                  styles.glowText,
                  styles.editableText,
                  {
                    color: colors.text,
                    fontSize: reflectFontStyle.fontSize,
                    lineHeight: reflectFontStyle.lineHeight,
                    fontWeight: '500',
                  }
                ]}
                value={editedReflect}
                onChangeText={setEditedReflect}
                placeholder="Reflect..."
                placeholderTextColor={colors.dim}
                multiline
              />
            ) : (
              <Text style={[
                styles.glowText,
                {
                  color: colors.text,
                  fontSize: reflectFontStyle.fontSize,
                  lineHeight: reflectFontStyle.lineHeight,
                  fontWeight: '500',
                  letterSpacing: lsTight, // PSS: Compression before wrap
                }
              ]}>
                {item.desire}
              </Text>
            )}
          </View>
        )}

        {/* Note Input - compact */}
        <TextInput
          style={[
            styles.noteInput,
            {
              backgroundColor: timeGlow.backgroundColor,
              color: colors.text,
              borderColor: timeGlow.borderColor,
              minHeight: scaleValue(40, cardScale),
              paddingVertical: scaleValue(14, cardScale),
              paddingHorizontal: scaleValue(12, cardScale),
              marginTop: gap,
              marginBottom: gap,
              fontSize: fsBody - 2,
              lineHeight: Math.round((fsBody - 2) * lhBody),
              letterSpacing: lsTight,
            },
          ]}
          placeholder="Sprawl text if the moment drives you..."
          placeholderTextColor={colors.dim}
          value={note}
          onChangeText={setNote}
          multiline={true}
          numberOfLines={2}
        />

        {/* Action Buttons - compact grid or Save button in edit mode */}
        {isEditMode ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.didItButton, { backgroundColor: colors.accent }]}
            onPress={() => {
              if (onSave) {
                onSave({
                  ...item,
                  title: editedTitle,
                  body_cue: editedNotice,
                  micro: editedAct,
                  desire: editedReflect,
                });
              }
              onClose();
            }}
          >
            <Text style={[styles.didItText, { color: colors.bg }]}>SAVE CHANGES</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.actionGrid, { gap: btnGap }]}>
            {/* Flow Aligned Button - similar to other buttons but more saturated */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: timeGlow.shadowColor + '50',
                  borderColor: timeGlow.shadowColor + 'AA',
                  borderWidth: 1.5,
                  height: alignFlowHeight,
                  marginTop: gap,
                  marginBottom: gap,
                  width: '100%',
                }
              ]}
              onPress={() => {
                setShowCheckmark(true);
                // Call onAlignFlow to update emoji in parent
                if (onAlignFlow) {
                  onAlignFlow();
                }
                // Close modal after brief delay to show checkmark
                setTimeout(() => {
                  onClose();
                }, 300);
              }}
            >
              <Text
                allowFontScaling={false}
                style={[
                  styles.actionButtonText,
                  {
                    color: colors.text,
                    fontSize: fsBody - 1,
                    fontWeight: '600',
                    letterSpacing: 0.3,
                    ...(Platform.OS === 'android' ? { lineHeight: Math.round((fsBody - 1) * 1.3) } : {}),
                  }
                ]}
              >
                {showCheckmark ? '🜁' : 'Align Flow'}
              </Text>
            </TouchableOpacity>

            {actionButtons.map((action) => (
              <Animated.View
                key={action}
                style={{
                  width: '48%',
                  transform: [{ scale: breathScale }],
                  opacity: breathOpacity,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: colors.accent + '15',
                      borderColor: colors.accent + '30',
                      borderWidth: 1,
                      opacity: action === 'not relevant' ? 0.7 : 1,
                      width: '100%',
                      height: btnHeight, // PSS
                    },
                  ]}
                  onPress={() => onComplete(action as any, note)}
                >
                  <Text 
                    allowFontScaling={false}
                    style={[
                      styles.actionText, 
                      { 
                        color: colors.text,
                        fontSize: fsBody - 2,
                        letterSpacing: -0.1, // Reduced from lsTight (-0.2) to avoid clipping
                        includeFontPadding: false, // Android-only
                        textAlignVertical: 'center', // Android-only
                        ...(Platform.OS === 'android' ? { lineHeight: Math.round((fsBody - 2) * 1.2) } : {}),
                      }
                    ]}>{actionButtonLabels[action] || action}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // NO flex: 1 - allow content-driven height
    flexGrow: 0,
    flexShrink: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderRadius: 32, // Soft rounded corners for modal card
    overflow: 'hidden', // Ensure content respects rounded corners
  },
  title: {
    fontSize: 20, // Reduced from 22
    fontWeight: '700',
    marginBottom: 24, // Increased spacing between title and content boxes
  },
  // Label inside the bubble - centered, same color as text
  inlineLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 12, // Increased from 6 for better label/content separation
    opacity: 0.6, // Slightly dimmed but same color
  },
  content: {
    // NO flex: 1 - allow content-driven height
    flexGrow: 0,
    flexShrink: 1,
  },
  // Organic glow blocks
  glowBlock: {
    borderRadius: 24, // Even softer, more organic
    padding: 18, // Increased from 14 for more breathing room
    marginBottom: 12, // PSS base (overridden inline with gap)
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
    marginHorizontal: -12, // Extend width beyond normal bounds for wider boxes
  },
  largeBlock: {
    minHeight: 95, // Increased from 80 for better text coverage
  },
  mediumBlock: {
    minHeight: 100, // Increased from 85 for better text coverage
  },
  smallBlock: {
    minHeight: 90, // Increased from 75 for better text coverage
  },
  glowText: {
    textAlign: 'center',
  },
  didItButton: {
    width: '100%',
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 24,
  },
  didItText: {
    fontSize: 17,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
    // DO NOT use flex:1 here - prevent stretching
    alignItems: 'stretch',
    height: 'auto' as any,
  },
  actionButton: {
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noteInput: {
    minHeight: 32,
    borderRadius: 24,
    padding: 8, // Reduced for morning/afternoon
    marginTop: 8, // Reduced for morning/afternoon
    marginBottom: 8, // Reduced for morning/afternoon
    borderWidth: 1,
    fontSize: 14,
    lineHeight: 19,
    // Anti-stretch
    flexGrow: 0,
    flexShrink: 1,
    height: undefined,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editableText: {
    minHeight: 40,
  },
});
