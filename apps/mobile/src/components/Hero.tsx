import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing } from "../theme/tokens";
import { IslamicGeometricBackground } from "./IslamicGeometricBackground";

type HeroProps = {
  onExplore: () => void;
};

export function Hero({ onExplore }: HeroProps) {
  const { height } = useWindowDimensions();
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandY = useRef(new Animated.Value(18)).current;
  const patternOpacity = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(patternOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(brandY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [brandOpacity, brandY, patternOpacity]);

  return (
    <View style={[styles.hero, { minHeight: height * 0.92 }]}>
      <LinearGradient
        colors={["#0F2E27", "#1F7A66", "#7BC4B0"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: patternOpacity }]}>
        <IslamicGeometricBackground tone="chalk" opacity={0.2} cellSize={88} />
      </Animated.View>

      <View style={styles.wash} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: brandOpacity,
            transform: [{ translateY: brandY }],
          },
        ]}
      >
        <Text style={styles.brand}>Miyarmint</Text>
        <Text style={styles.headline}>Learn markets the halal way.</Text>
        <Text style={styles.support}>
          Classrooms, paper portfolios, and screened equities for students and
          educators—static preview only.
        </Text>

        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <Pressable
            onPress={onExplore}
            onPressIn={() =>
              Animated.spring(ctaScale, {
                toValue: 0.97,
                useNativeDriver: true,
                speed: 40,
              }).start()
            }
            onPressOut={() =>
              Animated.spring(ctaScale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 40,
              }).start()
            }
            style={styles.cta}
          >
            <Text style={styles.ctaLabel}>See how it works</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    justifyContent: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    overflow: "hidden",
  },
  wash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(19, 33, 28, 0.22)",
  },
  content: {
    gap: spacing.md,
    zIndex: 2,
  },
  brand: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 48,
    lineHeight: 52,
    color: colors.chalk,
  },
  headline: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 28,
    lineHeight: 34,
    color: colors.mist,
    maxWidth: 320,
  },
  support: {
    fontFamily: "Manrope_400Regular",
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(251, 253, 252, 0.82)",
    maxWidth: 320,
    marginBottom: spacing.sm,
  },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: colors.chalk,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  ctaLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 15,
    color: colors.ink,
  },
});
