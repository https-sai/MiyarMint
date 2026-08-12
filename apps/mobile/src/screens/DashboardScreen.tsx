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
import { useAuth } from "../auth/AuthContext";
import { getPortfolio, type PortfolioResponse } from "../api/client";
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

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export function DashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setError(null);
    try {
      const portfolio = await getPortfolio(user.id);
      setData(portfolio);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio");
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

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Miyarmint</Text>
          <Text style={styles.subtitle}>Paper portfolio</Text>
        </View>
        <Pressable onPress={() => void signOut()}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.mint} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: insets.bottom + spacing.xl,
            gap: spacing.lg,
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

          <View style={styles.balanceBlock}>
            <Text style={styles.balanceLabel}>Cash balance</Text>
            <Text style={styles.balanceValue}>
              {formatMoney(data?.portfolio.cash_balance ?? 0)}
            </Text>
            <Text style={styles.balanceHint}>
              Virtual funds for classroom trading practice.
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate("Trade")}
            style={styles.tradeCta}
          >
            <Text style={styles.tradeCtaLabel}>Join class / place trade</Text>
          </Pressable>

          <View>
            <Text style={styles.sectionTitle}>Recent trades</Text>
            {(data?.trades.length ?? 0) === 0 ? (
              <Text style={styles.empty}>No trades yet.</Text>
            ) : (
              data?.trades.map((trade) => (
                <View key={trade.id} style={styles.tradeRow}>
                  <Text style={styles.tradeTicker}>{trade.ticker}</Text>
                  <Text style={styles.tradeMeta}>
                    {trade.side.toUpperCase()} · {trade.quantity} @{" "}
                    {formatMoney(trade.price)}
                  </Text>
                </View>
              ))
            )}
          </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xl,
  },
  brand: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 32,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: "Manrope_400Regular",
    color: colors.mute,
    marginTop: 4,
  },
  signOut: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.mint,
    fontSize: 14,
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
  balanceBlock: {
    backgroundColor: colors.chalk,
    borderWidth: 1,
    borderColor: colors.mist,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  balanceLabel: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.mute,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  balanceValue: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 40,
    color: colors.ink,
  },
  balanceHint: {
    fontFamily: "Manrope_400Regular",
    color: colors.mute,
    fontSize: 14,
  },
  tradeCta: {
    backgroundColor: colors.mint,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  tradeCtaLabel: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.chalk,
    fontSize: 15,
  },
  sectionTitle: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 22,
    color: colors.ink,
    marginBottom: spacing.sm,
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
