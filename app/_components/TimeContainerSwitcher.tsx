import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ContainerId, ColorScheme } from '../_constants/Types';

interface Props {
  active: ContainerId;
  onSelect: (container: ContainerId) => void;
  colors: ColorScheme;
}

const CONTAINERS: { id: ContainerId; label: string }[] = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
  { id: 'late', label: 'Late Night' },
];

export const TimeContainerSwitcher = React.memo(({ active, onSelect, colors }: Props) => {
  return (
    <View style={styles.container}>
      {CONTAINERS.map(container => {
        const isActive = container.id === active;
        return (
          <TouchableOpacity
            key={container.id}
            style={[
              styles.button,
              {
                backgroundColor: isActive ? colors.accent : 'transparent',
                borderColor: colors.dim,
              },
            ]}
            onPress={() => onSelect(container.id)}
          >
            <Text
              style={[
                styles.text,
                {
                  color: isActive ? colors.card : colors.text,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}
            >
              {container.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 24,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    // Using a fixed width to ensure all four fit on one line in a typical phone view,
    // as suggested by the user's "1 across" request, assuming a small screen.
    // The previous code had `marginRight: 8` and `flexWrap: 'wrap'`, which should have worked.
    // I will try to make the buttons smaller.
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: '23%', // Roughly 4 buttons across with some margin
    marginRight: 4,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
  },
});

