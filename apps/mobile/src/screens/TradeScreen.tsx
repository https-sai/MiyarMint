import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { joinClassroom, placeTrade } from "../api/client";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { colors, spacing } from "../theme/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "Trade">;

export function TradeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [joinCode, setJoinCode] = useState("");
  const [ticker, setTicker] = useState("AAPL");
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onJoin = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await joinClassroom(joinCode);
      setMessage(`Joined ${result.classroom.name}`);
      setJoinCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Join failed");
    } finally {
      setBusy(false);
    }
  };

  const onTrade = async (side: "buy" | "sell") => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await placeTrade({
        ticker,
        side,
        quantity: Number(quantity),
      });
      setMessage(
        `${result.trade.side.toUpperCase()} ${result.trade.quantity} ${result.trade.ticker} confirmed`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trade failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>

      <Text style={styles.title}>Classroom & trade</Text>
      <Text style={styles.support}>
        Join with a code, then place a paper trade in a compliant ticker.
      </Text>

      <Text style={styles.label}>Join code</Text>
      <TextInput
        value={joinCode}
        onChangeText={setJoinCode}
        autoCapitalize="characters"
        placeholder="ABC123"
        placeholderTextColor={colors.mute}
        style={styles.input}
      />
      <Pressable
        onPress={onJoin}
        disabled={busy || joinCode.trim().length < 4}
        style={[styles.cta, (busy || joinCode.trim().length < 4) && styles.disabled]}
      >
        <Text style={styles.ctaLabel}>Join classroom</Text>
      </Pressable>

      <Text style={[styles.label, { marginTop: spacing.xl }]}>Ticker</Text>
      <TextInput
        value={ticker}
        onChangeText={setTicker}
        autoCapitalize="characters"
        style={styles.input}
      />
      <Text style={styles.label}>Quantity</Text>
      <TextInput
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <View style={styles.row}>
        <Pressable
          onPress={() => void onTrade("buy")}
          disabled={busy}
          style={[styles.cta, styles.flex, busy && styles.disabled]}
        >
          <Text style={styles.ctaLabel}>Buy</Text>
        </Pressable>
        <Pressable
          onPress={() => void onTrade("sell")}
          disabled={busy}
          style={[styles.ctaGhost, styles.flex, busy && styles.disabled]}
        >
          <Text style={styles.ctaGhostLabel}>Sell</Text>
        </Pressable>
      </View>

      {busy ? <ActivityIndicator color={colors.mint} style={{ marginTop: spacing.md }} /> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
  row: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
  cta: {
    backgroundColor: colors.mint,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  ctaLabel: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.chalk,
  },
  ctaGhost: {
    borderWidth: 1,
    borderColor: colors.mint,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  ctaGhostLabel: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.mint,
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
