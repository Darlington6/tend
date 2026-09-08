import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useRitualsStore } from '../../lib/store';

export default function RitualDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const { rituals, removeRitual } = useRitualsStore();

  const ritual = rituals.find((r) => String(r.id) === id);

  if (!ritual) {
    return (
      <View style={styles.container}>
        <Text style={typography.body}>Ritual not found.</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete ritual?', `"${ritual.name}" and its history will be archived.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeRitual(db, ritual.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { borderColor: ritual.color }]}>
        <Ionicons name={ritual.icon} size={32} color={ritual.color} />
      </View>
      <Text style={typography.title}>{ritual.name}</Text>
      <Text style={[typography.caption, styles.timeLabel]}>{ritual.time_of_day}</Text>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={[typography.title, { color: ritual.color }]}>{ritual.streak}</Text>
          <Text style={typography.caption}>day streak</Text>
        </View>
      </View>

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete ritual</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  timeLabel: {
    textTransform: 'capitalize',
    marginTop: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  deleteButton: {
    marginTop: 'auto',
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  deleteButtonText: {
    color: '#B04A2E',
    fontSize: 15,
    fontWeight: '600',
  },
});
