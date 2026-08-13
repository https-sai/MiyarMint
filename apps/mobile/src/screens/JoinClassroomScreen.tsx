import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { joinClassroom } from "../api/client";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { colors, spacing } from "../theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "JoinClassroom">;

export function JoinClassroomScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onJoin = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await joinClassroom(joinCode);
      setMessage(`Joined ${result.classroom.name}`);
      setJoinCode("");
      setTimeout(() => navigation.navigate("Classroom"), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Join failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + spacing.lg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>

      <Text style={styles.title}>Join class</Text>
      <Text style={styles.support}>
        Enter the join code from your educator.
      </Text>

      <Text style={styles.label}>Join code</Text>
      <TextInput
        value={joinCode}
        onChangeText={setJoinCode}
        autoCapitalize="characters"
        placeholder="MINT-7K2A"
        placeholderTextColor={colors.mute}
        style={styles.input}
      />

      <Pressable
        onPress={() => void onJoin()}
        disabled={busy || joinCode.trim().length < 4}
        style={[
          styles.cta,
          (busy || joinCode.trim().length < 4) && styles.disabled,
        ]}
      >
        {busy ? (
          <ActivityIndicator color={colors.chalk} />
        ) : (
          <Text style={styles.ctaLabel}>Join classroom</Text>
        )}
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </KeyboardAvoidingView>
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
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 28,
    color: colors.ink,
  },
  support: {
    fontFamily: "Manrope_400Regular",
    color: colors.mute,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  label: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.mute,
    marginBottom: spacing.xs,
    fontSize: 13,
  },
  input: {
    backgroundColor: colors.chalk,
    borderWidth: 1,
    borderColor: colors.mist,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: "Manrope_400Regular",
    fontSize: 16,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  cta: {
    backgroundColor: colors.mint,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  ctaLabel: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.chalk,
  },
  disabled: { opacity: 0.5 },
  message: {
    marginTop: spacing.md,
    fontFamily: "Manrope_400Regular",
    color: colors.mint,
  },
  error: {
    marginTop: spacing.md,
    fontFamily: "Manrope_400Regular",
    color: "#9B3B2E",
  },
});
