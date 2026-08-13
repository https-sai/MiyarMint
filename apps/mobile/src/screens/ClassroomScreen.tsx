import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getMyClassrooms,
  type ClassroomSummary,
} from "../api/client";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { colors, spacing } from "../theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "Classroom">;

export function ClassroomScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await getMyClassrooms();
      setClassrooms(result.classrooms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load classrooms");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>

      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Classroom</Text>
          <Text style={styles.support}>
            Your classes, join codes, educators, and classmates.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => navigation.navigate("JoinClassroom")}
        style={styles.joinCta}
      >
        <Text style={styles.joinCtaLabel}>Join class</Text>
      </Pressable>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.mint} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: insets.bottom + spacing.xl,
            gap: spacing.lg,
            marginTop: spacing.lg,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load();
              }}
              tintColor={colors.mint}
            />
          }
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {classrooms.length === 0 ? (
            <Text style={styles.empty}>
              You haven’t joined a classroom yet. Tap Join class to enter a code.
            </Text>
          ) : (
            classrooms.map((classroom) => (
              <View key={classroom.id} style={styles.card}>
                <Text style={styles.className}>{classroom.name}</Text>
                <Text style={styles.meta}>
                  Code · {classroom.join_code}
                </Text>
                <Text style={styles.meta}>
                  Educator · {classroom.educator?.display_name ?? "Unassigned"}
                </Text>

                <Text style={styles.membersTitle}>Members</Text>
                {classroom.members.length === 0 ? (
                  <Text style={styles.empty}>No members yet.</Text>
                ) : (
                  classroom.members.map((member) => (
                    <Text key={member.student_id} style={styles.member}>
                      {member.display_name}
                    </Text>
                  ))
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
  },
  back: { alignSelf: "flex-start", marginBottom: spacing.lg },
  backLabel: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.mint,
    fontSize: 15,
  },
  headerRow: {
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 28,
    color: colors.ink,
  },
  support: {
    fontFamily: "Manrope_400Regular",
    color: colors.mute,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  joinCta: {
    backgroundColor: colors.mint,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  joinCtaLabel: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.chalk,
    fontSize: 15,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    fontFamily: "Manrope_400Regular",
    color: "#9B3B2E",
  },
  empty: {
    fontFamily: "Manrope_400Regular",
    color: colors.mute,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.chalk,
    borderWidth: 1,
    borderColor: colors.mist,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  className: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 22,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  meta: {
    fontFamily: "Manrope_400Regular",
    color: colors.mute,
    fontSize: 14,
  },
  membersTitle: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  member: {
    fontFamily: "Manrope_400Regular",
    color: colors.ink,
    paddingVertical: 4,
  },
});
