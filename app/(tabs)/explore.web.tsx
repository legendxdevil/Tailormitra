import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';

export default function ExploreWebPlaceholder() {
  const theme = useColorScheme() ?? 'light';
  const tint = Colors[theme].tint;
  const [pin, setPin] = useState('');
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          value={pin}
          onChangeText={setPin}
          placeholder="Enter PIN code"
          keyboardType="number-pad"
          style={[styles.input, theme === 'dark' && styles.inputDark]}
          maxLength={6}
          placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
        />
        <Pressable style={[styles.btn, { backgroundColor: tint }]}> 
          <ThemedText style={styles.btnText}>Search</ThemedText>
        </Pressable>
      </View>
      <ThemedView style={styles.center}>
        <ThemedText>
          Map preview is not supported on web. Please run on Android/iOS device to view the interactive map.
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputDark: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#333',
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: '#fff', fontWeight: '600' },
});
