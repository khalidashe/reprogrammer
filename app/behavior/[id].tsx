import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import useStore from '@/store/useStore';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { cancelForBehavior, sendTestNotification } from '@/services/notifications';
import { bucketLevel } from '@/services/fsrs';

export default function BehaviorDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams();
  const { behaviors, checkIns, getStreak, deleteBehavior, updateBehavior } = useStore();
  const [, setRefresh] = useState({});

  useFocusEffect(
    useCallback(() => {
      setRefresh({});
    }, [])
  );

  const behavior = behaviors.find(b => b.id === id as string);
  const behaviorCheckIns = (behavior
    ? checkIns.filter(c => c.behaviorId === behavior.id).sort((a, b) => b.at - a.at)
    : []
  ).slice(0, 20);

  if (!behavior) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          State not found
        </Text>
      </View>
    );
  }

  const streak = getStreak(behavior.id);

  const handleEdit = () => {
    router.push({ pathname: '/create', params: { id: behavior.id } });
  };

  const handleDelete = () => {
    Alert.alert('Delete State', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          await cancelForBehavior(behavior.id);
          await deleteBehavior(behavior.id);
          router.back();
        },
        style: 'destructive',
      },
    ]);
  };

  const handleToggleBookmark = async () => {
    await updateBehavior({
      ...behavior,
      bookmarked: !behavior.bookmarked,
    });
  };

  const handleArchive = async () => {
    await updateBehavior({
      ...behavior,
      hidden: true,
    });
    router.back();
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification(behavior);
      Alert.alert('Test Notification Sent', 'Check your notifications in 1 second');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>
              {behavior.title}
            </Text>
          </View>
          <Pressable
            onPress={handleTestNotification}
            style={[styles.testButton, { backgroundColor: colors.tint }]}
          >
            <Text style={styles.testButtonText}>Test</Text>
          </Pressable>
        </View>
        <Text style={[styles.message, { color: colors.text }]}>
          {behavior.pingMessage}
        </Text>
      </View>

      <View style={[styles.streakCard, { backgroundColor: colors.tint }]}>
        <Text style={styles.streakLabel}>Current Streak</Text>
        <Text style={styles.streakValue}>{streak}</Text>
        <Text style={styles.streakDays}>days</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Details
        </Text>
        <View style={[styles.detailItem, { borderBottomColor: colors.text + '20' }]}>
          <Text style={[styles.detailLabel, { color: colors.text }]}>Time Window</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {behavior.window.from === '00:00' && behavior.window.to === '23:59'
              ? 'All day'
              : `${behavior.window.from} – ${behavior.window.to}`}
          </Text>
        </View>
        <View style={[styles.detailItem, { borderBottomColor: colors.text + '20' }]}>
          <Text style={[styles.detailLabel, { color: colors.text }]}>Interval</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            every {behavior.intervalMinutes} min
          </Text>
        </View>
        <View style={[styles.detailItem, { borderBottomColor: colors.text + '20' }]}>
          <Text style={[styles.detailLabel, { color: colors.text }]}>Level</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            L{bucketLevel(behavior.stability)} · stability {behavior.stability.toFixed(1)}h
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Check-ins
        </Text>
        {behaviorCheckIns.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No check-ins yet
          </Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={behaviorCheckIns}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const date = new Date(item.at);
              const timeStr = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const dateStr = date.toLocaleDateString();

              return (
                <View
                  style={[
                    styles.checkInItem,
                    {
                      backgroundColor:
                        item.result === 'yes'
                          ? colors.tint + '20'
                          : colors.text + '20',
                      borderLeftColor:
                        item.result === 'yes' ? colors.tint : colors.text,
                    },
                  ]}
                >
                  <View style={styles.checkInHeader}>
                    <Text
                      style={[
                        styles.checkInResult,
                        {
                          color: item.result === 'yes' ? colors.tint : colors.text,
                        },
                      ]}
                    >
                      {item.result === 'yes' ? '✓ Yes' : '✗ No'}
                    </Text>
                    <Text style={[styles.checkInTime, { color: colors.text }]}>
                      {dateStr} {timeStr}
                    </Text>
                  </View>
                  {item.note && (
                    <Text style={[styles.checkInNote, { color: colors.text }]}>
                      {item.note}
                    </Text>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>

      <View style={styles.actionButtons}>
        <Pressable
          onPress={handleEdit}
          style={[styles.actionButton, { backgroundColor: colors.tint }]}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={handleToggleBookmark}
          style={[
            styles.actionButton,
            { borderColor: colors.tint, borderWidth: 1, backgroundColor: 'transparent' },
          ]}
        >
          <Text style={[styles.actionButtonText, { color: colors.tint }]}>
            {behavior.bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleArchive}
          style={[styles.actionButton, { backgroundColor: colors.text + '20' }]}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            Archive
          </Text>
        </Pressable>
        <Pressable
          onPress={handleDelete}
          style={[styles.actionButton, { backgroundColor: '#ff0000' }]}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  testButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
  },
  streakCard: {
    margin: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  streakLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  streakValue: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  streakDays: {
    color: 'white',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
  checkInItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  checkInResult: {
    fontWeight: '600',
    fontSize: 14,
  },
  checkInTime: {
    fontSize: 12,
  },
  checkInNote: {
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});
