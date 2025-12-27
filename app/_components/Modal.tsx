import React, { useState, useEffect } from 'react';
import { Modal as ReactNativeModal, View, StyleSheet, TouchableWithoutFeedback, useWindowDimensions, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ isVisible, onClose, children }: Props) => {
  const { height: windowHeight } = useWindowDimensions();
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  
  // Soft cap so long cards don't overflow small screens
  const MAX_HEIGHT = Math.floor(windowHeight * 0.86);
  // Measure real content height, NO pre-reserved space
  const targetHeight = contentHeight ? Math.min(contentHeight, MAX_HEIGHT) : null;
  
  // Hide navigation bar when modal is visible (Android)
  useEffect(() => {
    if (Platform.OS === 'android') {
      if (isVisible) {
        // Hide navigation bar for immersive experience
        NavigationBar.setVisibilityAsync('hidden');
      } else {
        // Restore navigation bar
        NavigationBar.setVisibilityAsync('visible');
      }
    }
    
    // Cleanup: restore navigation bar when component unmounts
    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
    };
  }, [isVisible]);
  
  return (
    <ReactNativeModal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalView, targetHeight ? { height: targetHeight } : undefined]}>
              <View
                onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
                style={styles.contentWrapper}
              >
                {children}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)', // Darker background for full-screen feel
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden', // Clip content to the rounded corners
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '92%', // Set a width to the modal
    maxWidth: 640, // Max width for larger screens
    alignSelf: 'center', // Center the card
    // IMPORTANT: never pre-declare flex/height/maxHeight here
    // NO flex: 1 - allow content-driven height
  },
  contentWrapper: {
    // IMPORTANT: do not stretch; let intrinsic height pass through
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexGrow: 0,
    flexShrink: 1,
    height: undefined,
    minHeight: undefined,
  },
});

