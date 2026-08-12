import type { NativeStackScreenProps } from "@react-navigation/native-stack";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { colors, spacing } from "../theme/tokens";

type Mode = "signin" | "signup";
type Props = NativeStackScreenProps<RootStackParamList, "Auth">;

export function AuthScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName.trim() || undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth failed");
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

      <Text style={styles.brand}>Miyarmint</Text>
      <Text style={styles.title}>
        {mode === "signin" ? "Student sign in" : "Create student account"}
      </Text>
      <Text style={styles.support}>
        Use your school email. Your virtual portfolio starts at $100,000.
      </Text>

      <View style={styles.form}>
        {mode === "signup" ? (
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Display name"
            placeholderTextColor={colors.mute}
            autoCapitalize="words"
            style={styles.input}
          />
        ) : null}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.mute}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.mute}
          secureTextEntry
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={submit}
          disabled={busy || !email || password.length < 6}
          style={[
            styles.cta,
            (busy || !email || password.length < 6) && styles.ctaDisabled,
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.chalk} />
          ) : (
            <Text style={styles.ctaLabel}>
              {mode === "signin" ? "Sign in" : "Sign up"}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            setError(null);
            setMode(mode === "signin" ? "signup" : "signin");
          }}
        >
          <Text style={styles.switch}>
            {mode === "signin"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
  },
  back: {
    alignSelf: "flex-start",
    marginBottom: spacing.lg,
  },
  backLabel: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.mint,
    fontSize: 15,
  },
  brand: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 36,
    color: colors.ink,
  },
  title: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 24,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  support: {
    fontFamily: "Manrope_400Regular",
    fontSize: 15,
    lineHeight: 22,
    color: colors.mute,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
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
  },
  error: {
    fontFamily: "Manrope_400Regular",
    color: "#9B3B2E",
    fontSize: 14,
  },
  cta: {
    backgroundColor: colors.mint,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaLabel: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.chalk,
    fontSize: 15,
  },
  switch: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.mint,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
