import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export type QuickLogCategory = 'substance' | 'nourish' | 'movement';

const COLORS = {
  bg: '#0f0f23',
  card: '#1a1a2e',
  text: '#e8e8f0',
  dim: '#6b7280',
  border: '#2a2a3e',
  substance: '#22c55e',
  nourish: '#ef4444',
  movement: '#f97316',
};

interface ActionItem {
  id: QuickLogCategory;
  label: string;
  glyph: string;
  color: string;
}

const ACTIONS: ActionItem[] = [
  { id: 'substance', label: 'Substance', glyph: 'S', color: COLORS.substance },
  { id: 'nourish', label: 'Nourish', glyph: 'N', color: COLORS.nourish },
  { id: 'movement', label: 'Movement', glyph: 'M', color: COLORS.movement },
];

function ActionButton({ item }: { item: ActionItem }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      clickActionData={{ category: item.id }}
      style={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 88,
        backgroundColor: COLORS.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 10,
        paddingHorizontal: 8,
      }}
    >
      <FlexWidget
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: item.color,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 6,
        }}
      >
        <TextWidget
          text={item.glyph}
          style={{
            color: COLORS.bg,
            fontSize: 12,
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
        backgroundColor: COLORS.bg,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 14,
        justifyContent: 'center',
      }}
    >
      <FlexWidget
        style={{
          width: 'match_parent',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <TextWidget
          text="Quip Transmit"
          style={{
            color: COLORS.text,
            fontSize: 16,
            fontWeight: '700',
            textAlign: 'center',
          }}
        />
      </FlexWidget>

      <FlexWidget
        style={{
          height: 1,
          backgroundColor: COLORS.border,
          marginBottom: 12,
        }}
      />

      <FlexWidget
        style={{
          width: 'match_parent',
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
