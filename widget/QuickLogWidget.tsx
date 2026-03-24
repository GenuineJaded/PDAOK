/**
 * QuickLogWidget.tsx
 *
 * Android home screen widget for PDAOK-X.
 * Renders three tappable rows — Substance, Nourish, Movement — that each
 * fire a deep-link click action.  Tapping any row opens the app directly
 * into the corresponding quick-log modal, with zero extra navigation.
 *
 * Visual language: dark background (#0f0f23), accent purple (#7c3aed),
 * matching the app's existing aesthetic.
 */

import React from 'react';
import {
  FlexWidget,
  TextWidget,
  ImageWidget,
} from 'react-native-android-widget';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuickLogCategory = 'substance' | 'nourish' | 'movement';

// ---------------------------------------------------------------------------
// Colour palette (mirrors the app's dark theme)
// ---------------------------------------------------------------------------

const COLORS = {
  bg: '#0f0f23',
  card: '#1a1a2e',
  accent: '#7c3aed',
  accentSoft: '#7c3aed33',
  text: '#e8e8f0',
  dim: '#6b7280',
  border: '#2a2a3e',
  substanceGreen: '#22c55e',
  nourishRed: '#ef4444',
  movementOrange: '#f97316',
};

// ---------------------------------------------------------------------------
// Row item definition
// ---------------------------------------------------------------------------

interface RowItem {
  id: QuickLogCategory;
  label: string;
  emoji: string;
  color: string;
}

const ROWS: RowItem[] = [
  { id: 'substance', label: 'Substance', emoji: '🌿', color: COLORS.substanceGreen },
  { id: 'nourish',   label: 'Nourish',   emoji: '🍎', color: COLORS.nourishRed },
  { id: 'movement',  label: 'Movement',  emoji: '🏃', color: COLORS.movementOrange },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LogRow({ item }: { item: RowItem }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      clickActionData={{ category: item.id }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      {/* Colour accent strip */}
      <FlexWidget
        style={{
          width: 3,
          height: 28,
          borderRadius: 2,
          backgroundColor: item.color,
          marginRight: 12,
        }}
      />

      {/* Emoji */}
      <TextWidget
        text={item.emoji}
        style={{
          fontSize: 20,
          marginRight: 10,
        }}
      />

      {/* Label */}
      <TextWidget
        text={item.label}
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: COLORS.text,
          flex: 1,
        }}
      />

      {/* Chevron hint */}
      <TextWidget
        text="›"
        style={{
          fontSize: 18,
          color: COLORS.dim,
        }}
      />
    </FlexWidget>
  );
}

// ---------------------------------------------------------------------------
// Main widget
// ---------------------------------------------------------------------------

export function QuickLogWidget() {
  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: 'column',
        backgroundColor: COLORS.bg,
        borderRadius: 16,
        padding: 12,
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <TextWidget
          text="⚡"
          style={{ fontSize: 16, marginRight: 6 }}
        />
        <TextWidget
          text="Quick Log"
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: COLORS.text,
            flex: 1,
          }}
        />
        <TextWidget
          text="PDA.OK"
          style={{
            fontSize: 10,
            color: COLORS.dim,
          }}
        />
      </FlexWidget>

      {/* Divider */}
      <FlexWidget
        style={{
          height: 1,
          backgroundColor: COLORS.border,
          marginBottom: 10,
        }}
      />

      {/* Log rows */}
      {ROWS.map((item) => (
        <LogRow key={item.id} item={item} />
      ))}
    </FlexWidget>
  );
}
