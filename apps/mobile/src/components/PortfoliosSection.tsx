import { Image, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { colors, spacing } from "../theme/tokens";
import { SectionHeader } from "./SectionHeader";
import { IslamicGeometricBackground } from "./IslamicGeometricBackground";

type Compliance = "compliant" | "non_compliant" | "under_review";

const portfolios = [
  {
    student: "Jonah Lee",
    cashBalance: 100000,
    tint: "#1F7A66",
    holdings: [
      { ticker: "AAPL", company: "Apple Inc.", status: "compliant" as Compliance, side: "buy", qty: 12, price: 189.4 },
      { ticker: "MSFT", company: "Microsoft", status: "compliant" as Compliance, side: "buy", qty: 8, price: 412.1 },
    ],
  },
  {
    student: "Sara Malik",
    cashBalance: 86420.5,
    tint: "#2B4A42",
    holdings: [
      { ticker: "TSLA", company: "Tesla", status: "under_review" as Compliance, side: "buy", qty: 5, price: 248.0 },
      { ticker: "JPM", company: "JPMorgan", status: "non_compliant" as Compliance, side: "sell", qty: 10, price: 198.2 },
    ],
  },
  {
    student: "Ethan Park",
    cashBalance: 112350,
    tint: "#A67C52",
    holdings: [
      { ticker: "NVDA", company: "NVIDIA", status: "compliant" as Compliance, side: "buy", qty: 6, price: 875.5 },
    ],
  },
];

const statusLabel: Record<Compliance, string> = {
  compliant: "Compliant",
  non_compliant: "Non-compliant",
  under_review: "Under review",
};

function formatCash(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function PortfoliosSection() {
  const { width } = useWindowDimensions();
  const tileWidth = Math.min(width - spacing.lg * 2, 420);

  return (
    <View style={styles.section}>
      <IslamicGeometricBackground tone="ink" opacity={0.06} cellSize={120} />

      <View style={styles.content}>
        <SectionHeader
          eyebrow="Portfolios"
          title="Paper cash. Screened tickers. Real lessons."
          body="Each student starts with a simulated balance, then buys and sells only against the halal stock list."
        />

        <View style={styles.stack}>
          {portfolios.map((item) => (
            <View key={item.student} style={[styles.tile, { width: tileWidth }]}>
              <View style={[styles.plane, { backgroundColor: item.tint }]}>
                <IslamicGeometricBackground
                  tone="chalk"
                  opacity={0.16}
                  cellSize={72}
                />
                <View style={styles.planeCopy}>
                  <Text style={styles.planeMark}>{item.student}</Text>
                  <Text style={styles.planeCash}>
                    {formatCash(item.cashBalance)}
                  </Text>
                  <Text style={styles.planeHint}>Cash balance</Text>
                </View>
              </View>

              <Text style={styles.tileTitle}>Recent trades</Text>
              {item.holdings.map((trade) => (
                <View
                  key={`${item.student}-${trade.ticker}-${trade.side}`}
                  style={styles.tradeRow}
                >
                  <View style={styles.tradeMain}>
                    <Text style={styles.ticker}>{trade.ticker}</Text>
                    <Text style={styles.company}>{trade.company}</Text>
                  </View>
                  <View style={styles.tradeMeta}>
                    <Text style={styles.side}>
                      {trade.side.toUpperCase()} · {trade.qty} @ {trade.price}
                    </Text>
                    <Text
                      style={[
                        styles.status,
                        trade.status === "compliant" && styles.statusOk,
                        trade.status === "non_compliant" && styles.statusNo,
                        trade.status === "under_review" && styles.statusWait,
                      ]}
                    >
                      {statusLabel[trade.status]}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Image
            source={require("../../assets/splash-icon.png")}
            style={styles.mark}
            resizeMode="contain"
          />
          <Text style={styles.footerCopy}>Miyarmint · sample landing</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.chalk,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.section,
    paddingBottom: spacing.xxl,
    overflow: "hidden",
  },
  content: {
    zIndex: 1,
  },
  stack: {
    gap: spacing.xxl,
  },
  tile: {
    gap: spacing.md,
  },
  plane: {
    minHeight: 160,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  planeCopy: {
    padding: spacing.md,
    gap: 4,
    zIndex: 1,
  },
  planeMark: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 18,
    color: "rgba(251, 253, 252, 0.75)",
  },
  planeCash: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 36,
    color: colors.chalk,
  },
  planeHint: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: "rgba(251, 253, 252, 0.7)",
  },
  tileTitle: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.mute,
  },
  tradeRow: {
    gap: 6,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(19, 33, 28, 0.12)",
  },
  tradeMain: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  ticker: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 22,
    color: colors.ink,
  },
  company: {
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
    color: colors.mute,
  },
  tradeMeta: {
    gap: 2,
  },
  side: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 13,
    color: colors.ink,
  },
  status: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
  },
  statusOk: {
    color: colors.mint,
  },
  statusNo: {
    color: colors.clay,
  },
  statusWait: {
    color: "#8A6B2F",
  },
  footer: {
    marginTop: spacing.section,
    alignItems: "center",
    gap: spacing.sm,
  },
  mark: {
    width: 36,
    height: 36,
    opacity: 0.55,
  },
  footerCopy: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: colors.mute,
  },
});
