import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import useStore from '@/store/useStore';
import { CheckIn } from '@/types';
import { generateUUID } from '@/utils/uuid';
import { handleCheckInResponse } from '@/services/notifications';
import { useState, useMemo } from 'react';

export default function CheckInScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { behaviorId, attemptId } = useLocalSearchParams();
  const { behaviors, addCheckIn, getStreak } = useStore();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const behavior = useMemo(
    () => behaviors.find(b => b.id === behaviorId as string),
    [behaviors, behaviorId]
  );

  const handleResponse = async (result: 'yes' | 'no') => {
    if (!behavior || !behaviorId || !attemptId) return;

    setIsSubmitting(true);

    try {
      const checkIn: CheckIn = {
        id: generateUUID(),
        behaviorId: behavior.id,
        at: Date.now(),
        result,
        note: note || undefined,
      };

      await addCheckIn(checkIn);
      await handleCheckInResponse(behavior.id, attemptId as string, result);

      router.back();
    } catch (error) {
      console.error('Failed to record check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!behavior) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          State not found
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.behaviorTitle, { color: colors.text }]}>
          {behavior.title}
        </Text>
        <Text style={[styles.message, { color: colors.text }]}>
          {behavior.pingMessage}
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => handleResponse('yes')}
            disabled={isSubmitting}
            style={[
              styles.button,
              styles.yesButton,
              { backgroundColor: colors.tint, opacity: isSubmitting ? 0.5 : 1 },
            ]}
          >
            <Text style={styles.buttonText}>✓ Yes</Text>
          </Pressable>
          <Pressable
            onPress={() => handleResponse('no')}
            disabled={isSubmitting}
            style={[
              styles.button,
              styles.noButton,
              {
                borderColor: colors.tint,
                opacity: isSubmitting ? 0.5 : 1,
              },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.tint }]}>✗ No</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Add a note (optional)</Text>
        <TextInput
          style={[styles.noteInput, { color: colors.text, borderColor: colors.text }]}
          placeholder="How did it go?"
          placeholderTextColor={colors.text + '80'}
          value={note}
          onChangeText={setNote}
          multiline
          editable={!isSubmitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  behaviorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  yesButton: {},
  noButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
  },
});
