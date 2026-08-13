import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import { getPortfolio, placeTrade, type Trade } from "../api/client";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { colors, spacing } from "../theme/tokens";

function formatMoney(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

type Props = NativeStackScreenProps<RootStackParamList, "Trade">;

export function TradeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [ticker, setTicker] = useState("AAPL");
  const [quantity, setQuantity] = useState("1");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setError(null);
    try {
      const portfolio = await getPortfolio(user.id);
      setTrades(portfolio.trades);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trades");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

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
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trade failed");
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

      <Text style={styles.title}>Trade</Text>
      <Text style={styles.support}>
        Place a paper buy or sell against compliant tickers.
      </Text>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.md,
        }}
        keyboardShouldPersistTaps="handled"
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
        <Text style={styles.label}>Ticker</Text>
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

        {busy ? <ActivityIndicator color={colors.mint} /> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
          Recent trades
        </Text>
        {loading ? (
          <ActivityIndicator color={colors.mint} />
        ) : trades.length === 0 ? (
          <Text style={styles.empty}>No trades yet.</Text>
        ) : (
          trades.map((trade) => (
            <View key={trade.id} style={styles.tradeRow}>
              <Text style={styles.tradeTicker}>{trade.ticker}</Text>
              <Text style={styles.tradeMeta}>
                {trade.side.toUpperCase()} · {trade.quantity} @{" "}
                {formatMoney(trade.price)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
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
    marginBottom: spacing.sm,
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
    fontFamily: "Manrope_400Regular",
    color: colors.mint,
  },
  error: {
    fontFamily: "Manrope_400Regular",
    color: "#9B3B2E",
  },
  sectionTitle: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 22,
    color: colors.ink,
  },
  empty: {
    fontFamily: "Manrope_400Regular",
    color: colors.mute,
  },
  tradeRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.mist,
  },
  tradeTicker: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.ink,
    fontSize: 16,
  },
  tradeMeta: {
    fontFamily: "Manrope_400Regular",
    color: colors.mute,
    marginTop: 2,
  },
});
