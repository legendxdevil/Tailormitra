import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';

export function LoadingGif({ style, size = 96 }: { style?: ViewStyle; size?: number }) {
  return (
    <View style={[styles.container, style]}> 
      <Image
        source={require('@/assets/images/5a714c761ba960501b8617b1d388a3-unscreen.gif')}
        style={{ width: size, height: size }}
        contentFit="contain"
        cachePolicy="memory-disk"
        // Enable animation for GIFs
        // expo-image auto-plays animated formats like GIF/WebP
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
