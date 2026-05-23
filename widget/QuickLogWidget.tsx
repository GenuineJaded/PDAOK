/**
 * QuickLogWidget.tsx
 *
 * A thin 4x1 home-screen widget — three breathing buttons across one row:
 *   Substance · Nourish · Movement
 *
 * No header. No wasted vertical space. Each button is its own tap target,
 * each fires a deep link that the root layout intercepts to open the
 * matching quick-log modal directly (no tab navigation in between).
 *
 * The widget surface honors the current time container the same way the
 * app does — Morning warmth, Afternoon clarity, Evening sunset, Late
 * midnight — so the prosthetic feels alive even when it isn't tapped.
 *
 * Palette mirrors the Liminal theme (the app's default). The widget
 * re-renders on the system's normal update cycle, so the color shifts
 * naturally through the day without needing the app to be open.
 */

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuickLogCategory = 'substance' | 'nourish' | 'movement';

type ContainerKey = 'morning' | 'afternoon' | 'evening' | 'late';

interface FieldPalette {
  surface: string;       // widget background
  surfaceEdge: string;   // gradient end
  border: string;
  text: string;
  dim: string;
}

// ---------------------------------------------------------------------------
// Field palettes — mirror app/_constants/Themes.ts (Liminal, the default)
// ---------------------------------------------------------------------------

const FIELD: Record<ContainerKey, FieldPalette> = {
  morning: {
    surface: '#3A342C',
    surfaceEdge: '#4A3F35',
    border: '#5A4D40',
    text: '#F0E5D8',
    dim: '#C4A57B',
  },
  afternoon: {
    surface: '#2C3840',
    surfaceEdge: '#3A4550',
    border: '#455560',
    text: '#E8F0F5',
    dim: '#8FA8B8',
  },
  evening: {
    surface: '#333333',
    surfaceEdge: '#4D3A30',
    border: '#5A4438',
    text: '#F0E5D8',
    dim: '#B87333',
  },
  late: {
    surface: '#1A1A1A',
    surfaceEdge: '#242438',
    border: '#2A2A3E',
    text: '#F0F0F0',
    dim: '#A9B8A6',
  },
};

// ---------------------------------------------------------------------------
// Category accents — each ally keeps its identity across all containers,
// but the surrounding field shifts.
// ---------------------------------------------------------------------------

interface ActionItem {
  id: QuickLogCategory;
  label: string;
  glyph: string;
  accent: string;
  accentDark: string;
}

const ACTIONS: ActionItem[] = [
  {
    id: 'substance',
    label: 'Substance',
    glyph: '🌿',
    accent: '#5FA274',
    accentDark: '#1F3A28',
  },
  {
    id: 'nourish',
    label: 'Nourish',
    glyph: '🍎',
    accent: '#C26A6A',
    accentDark: '#3A1F1F',
  },
  {
    id: 'movement',
    label: 'Movement',
    glyph: '🏃',
    accent: '#D4884A',
    accentDark: '#3A2418',
  },
];

// ---------------------------------------------------------------------------
// Time-of-day → container key (mirrors app/_utils/time.ts)
// ---------------------------------------------------------------------------

function currentContainer(): ContainerKey {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'late';
}

// ---------------------------------------------------------------------------
// Deep-link URI — caught by _layout.tsx's Linking handler
// ---------------------------------------------------------------------------

// We deliberately use the bare scheme (no hostname) with a query string,
// instead of pdaok://quick-log?type=X. Expo Router treats the hostname of a
// pdaok:// URL as a potential route name, which races with our own deep-link
// listener and was producing intermittent "page not found" screens on the
// second-and-later taps of the widget. With no hostname, the router has
// nothing to match, and our handler in _layout.tsx is the only consumer.
const SCHEME = 'pdaok://';

function getActionUri(category: QuickLogCategory): string {
  return `${SCHEME}?action=quick-log&type=${category}`;
}

// ---------------------------------------------------------------------------
// One breathing button — glyph circle + label
// ---------------------------------------------------------------------------

function ActionButton({
  item,
  field,
}: {
  item: ActionItem;
  field: FieldPalette;
}) {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: getActionUri(item.id) }}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 4,
      }}
    >
      <FlexWidget
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: item.accent,
          backgroundGradient: {
            from: item.accent,
            to: item.accentDark,
            orientation: 'TL_BR',
          },
        }}
      >
        <TextWidget
          text={item.glyph}
          style={{
            fontSize: 20,
            textAlign: 'center',
          }}
        />
      </FlexWidget>

      <TextWidget
        text={item.label}
        maxLines={1}
        style={{
          color: field.text,
          fontSize: 12,
          fontWeight: '600',
          textAlign: 'center',
          marginTop: 6,
        }}
      />
    </FlexWidget>
  );
}

// ---------------------------------------------------------------------------
// Widget surface — three buttons in a single row, no header
// ---------------------------------------------------------------------------

export function QuickLogWidget() {
  const field = FIELD[currentContainer()];

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundGradient: {
          from: field.surface,
          to: field.surfaceEdge,
          orientation: 'TOP_BOTTOM',
        },
        borderRadius: 20,
        borderWidth: 1,
        borderColor: field.border,
        paddingHorizontal: 8,
        paddingVertical: 8,
      }}
    >
      {ACTIONS.map((item) => (
        <ActionButton key={item.id} item={item} field={field} />
      ))}
    </FlexWidget>
  );
}
