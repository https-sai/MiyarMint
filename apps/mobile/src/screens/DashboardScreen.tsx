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
import {
  getHalalStocks,
  getPortfolio,
  type HalalStock,
  type PortfolioResponse,
} from "../api/client";
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

const statusLabel: Record<HalalStock["status"], string> = {
  compliant: "Compliant",
  non_compliant: "Non-compliant",
  under_review: "Under review",
};

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export function DashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [stocks, setStocks] = useState<HalalStock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setError(null);
    try {
      const [portfolioRes, stocksRes] = await Promise.all([
        getPortfolio(user.id),
        getHalalStocks(),
      ]);
      setPortfolio(portfolioRes);
      setStocks(stocksRes.stocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
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
              {formatMoney(portfolio?.portfolio.cash_balance ?? 0)}
            </Text>
            <Text style={styles.balanceHint}>
              Virtual funds for classroom trading practice.
            </Text>
          </View>

          <View style={styles.navRow}>
            <Pressable
              onPress={() => navigation.navigate("Trade")}
              style={[styles.navCta, styles.navPrimary]}
            >
              <Text style={styles.navPrimaryLabel}>Trade</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Classroom")}
              style={[styles.navCta, styles.navSecondary]}
            >
              <Text style={styles.navSecondaryLabel}>Classroom</Text>
            </Pressable>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Halal stock list</Text>
            {stocks.length === 0 ? (
              <Text style={styles.empty}>No screened stocks yet.</Text>
            ) : (
              stocks.map((stock) => (
                <View key={stock.ticker} style={styles.stockRow}>
                  <View style={styles.stockMain}>
                    <Text style={styles.stockTicker}>{stock.ticker}</Text>
                    <Text style={styles.stockName}>
                      {stock.company_name ?? "—"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stockStatus,
                      stock.status === "compliant" && styles.statusOk,
                      stock.status === "non_compliant" && styles.statusBad,
                      stock.status === "under_review" && styles.statusReview,
                    ]}
                  >
                    {statusLabel[stock.status]}
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
  navRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  navCta: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  navPrimary: {
    backgroundColor: colors.mint,
  },
  navSecondary: {
    borderWidth: 1,
    borderColor: colors.mint,
    backgroundColor: colors.chalk,
  },
  navPrimaryLabel: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.chalk,
    fontSize: 15,
  },
  navSecondaryLabel: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.mint,
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
  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.mist,
    gap: spacing.md,
  },
  stockMain: {
    flex: 1,
  },
  stockTicker: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.ink,
    fontSize: 16,
  },
  stockName: {
    fontFamily: "Manrope_400Regular",
    color: colors.mute,
    marginTop: 2,
    fontSize: 13,
  },
  stockStatus: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
  },
  statusOk: { color: colors.mint },
  statusBad: { color: "#9B3B2E" },
  statusReview: { color: colors.clay },
});
