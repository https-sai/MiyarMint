import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/tokens";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  body: string;
  tone?: "ink" | "chalk";
};

export function SectionHeader({
  eyebrow,
  title,
  body,
  tone = "ink",
}: SectionHeaderProps) {
  const isChalk = tone === "chalk";

  return (
    <View style={styles.wrap}>
      <Text style={[styles.eyebrow, isChalk && styles.eyebrowChalk]}>
        {eyebrow}
      </Text>
      <Text style={[styles.title, isChalk && styles.titleChalk]}>{title}</Text>
      <Text style={[styles.body, isChalk && styles.bodyChalk]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  eyebrow: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: colors.mint,
  },
  eyebrowChalk: {
    color: colors.sand,
  },
  title: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink,
  },
  titleChalk: {
    color: colors.chalk,
  },
  body: {
    fontFamily: "Manrope_400Regular",
    fontSize: 16,
    lineHeight: 24,
    color: colors.mute,
    maxWidth: 340,
  },
  bodyChalk: {
    color: "rgba(251, 253, 252, 0.78)",
  },
});
