import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export type QuickLogCategory = 'substance' | 'nourish' | 'movement';

const SCHEME = 'pdaok://quick-log';

const COLORS = {
  bg: '#0f0f23',
  panel: '#141428',
  border: '#26263d',
  text: '#f2f1f7',
  dim: '#918fa5',
  substance: '#22c55e',
  substanceDark: '#0d2c1b',
  nourish: '#ef4444',
  nourishDark: '#341518',
  movement: '#f97316',
  movementDark: '#3a1e11',
};

interface ActionItem {
  id: QuickLogCategory;
  label: string;
  glyph: string;
  accent: string;
  shadow: string;
}

const ACTIONS: ActionItem[] = [
  {
    id: 'substance',
    label: 'Substance',
    glyph: 'S',
    accent: COLORS.substance,
    shadow: COLORS.substanceDark,
  },
  {
    id: 'nourish',
    label: 'Nourish',
    glyph: 'N',
    accent: COLORS.nourish,
    shadow: COLORS.nourishDark,
  },
  {
    id: 'movement',
    label: 'Movement',
    glyph: 'M',
    accent: COLORS.movement,
    shadow: COLORS.movementDark,
  },
];

function getActionUri(category: QuickLogCategory): string {
  return `${SCHEME}?type=${category}`;
}

function ActionButton({ item }: { item: ActionItem }) {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: getActionUri(item.id) }}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 4,
      }}
    >
      <FlexWidget
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
          borderWidth: 1,
          borderColor: item.accent,
          backgroundGradient: {
            from: item.accent,
            to: item.shadow,
            orientation: 'TL_BR',
          },
        }}
      >
        <TextWidget
          text={item.glyph}
          style={{
            color: COLORS.bg,
            fontSize: 16,
            fontWeight: '700',
            textAlign: 'center',
          }}
        />
      </FlexWidget>

      <TextWidget
        text={item.label}
        maxLines={1}
        style={{
          color: COLORS.text,
          fontSize: 13,
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: 6,
        }}
      />

      <FlexWidget
        style={{
          width: 44,
          height: 3,
          borderRadius: 2,
          backgroundGradient: {
            from: item.shadow,
            to: item.accent,
            orientation: 'LEFT_RIGHT',
          },
        }}
      />
    </FlexWidget>
  );
}

export function QuickLogWidget() {
  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        flexDirection: 'column',
        backgroundGradient: {
          from: '#101024',
          to: '#171733',
          orientation: 'TOP_BOTTOM',
        },
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12,
      }}
    >
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: SCHEME }}
        style={{
          width: 'match_parent',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 10,
          marginBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <TextWidget
          text="Quip Transmit"
          style={{
            color: COLORS.text,
            fontSize: 16,
            fontWeight: '700',
            textAlign: 'center',
            letterSpacing: 0.5,
          }}
        />
      </FlexWidget>

      <FlexWidget
        style={{
          width: 'match_parent',
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {ACTIONS.map((item) => (
          <ActionButton key={item.id} item={item} />
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
