import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing } from "../theme/tokens";
import { SectionHeader } from "./SectionHeader";
import { IslamicGeometricBackground } from "./IslamicGeometricBackground";

const classrooms = [
  {
    name: "Faith & Finance Lab",
    joinCode: "MINT-7K2A",
    educator: "Amina Rahman",
    members: 24,
  },
  {
    name: "Halal Markets 101",
    joinCode: "HLAL-9Q4R",
    educator: "Amina Rahman",
    members: 18,
  },
  {
    name: "Portfolio Practicum",
    joinCode: "PRTF-3N8C",
    educator: "Noor Haddad",
    members: 12,
  },
];

export function ClassroomsSection() {
  return (
    <View style={styles.section}>
      <LinearGradient
        colors={["#10241E", "#1A4338"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <IslamicGeometricBackground tone="chalk" opacity={0.12} cellSize={104} />
      <View style={styles.dim} />

      <View style={styles.content}>
        <SectionHeader
          tone="chalk"
          eyebrow="Classrooms"
          title="Join with a code. Trade with a cohort."
          body="Educators open a room, share a unique join code, and students enroll as classroom members."
        />

        <View style={styles.stack}>
          {classrooms.map((room) => (
            <View key={room.joinCode} style={styles.room}>
              <Text style={styles.roomTitle}>{room.name}</Text>
              <Text style={styles.joinCode}>Join code · {room.joinCode}</Text>
              <Text style={styles.note}>
                Educator {room.educator} · {room.members} students enrolled
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.section,
    overflow: "hidden",
  },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(16, 36, 30, 0.28)",
  },
  content: {
    zIndex: 1,
  },
  stack: {
    gap: spacing.xl,
  },
  room: {
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(251, 253, 252, 0.22)",
  },
  roomTitle: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 28,
    color: colors.chalk,
  },
  joinCode: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 13,
    letterSpacing: 0.6,
    color: colors.sand,
  },
  note: {
    fontFamily: "Manrope_400Regular",
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(251, 253, 252, 0.78)",
    maxWidth: 340,
  },
});
