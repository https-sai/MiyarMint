import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/tokens";
import { SectionHeader } from "./SectionHeader";
import { IslamicGeometricBackground } from "./IslamicGeometricBackground";

type ProfileRole = "student" | "educator" | "admin";

const profiles: {
  displayName: string;
  role: ProfileRole;
  detail: string;
}[] = [
  {
    displayName: "Amina Rahman",
    role: "educator",
    detail: "Leads Faith & Finance Lab · issues join codes",
  },
  {
    displayName: "Jonah Lee",
    role: "student",
    detail: "Paper portfolio · learning compliant equities",
  },
  {
    displayName: "Noor Haddad",
    role: "admin",
    detail: "Screens tickers · reviews compliance status",
  },
];

const roleLabel: Record<ProfileRole, string> = {
  student: "Student",
  educator: "Educator",
  admin: "Admin",
};

export function ProfilesSection() {
  return (
    <View style={styles.section}>
      <IslamicGeometricBackground tone="ink" opacity={0.07} cellSize={112} />

      <View style={styles.content}>
        <SectionHeader
          eyebrow="Profiles"
          title="Roles that shape the market floor."
          body="Each account is a student, educator, or admin—tied to auth, with a display name for the classroom."
        />

        <View style={styles.list}>
          {profiles.map((person, index) => (
            <View
              key={person.displayName}
              style={[
                styles.row,
                index < profiles.length - 1 && styles.rowBorder,
              ]}
            >
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor:
                      person.role === "educator"
                        ? colors.mint
                        : person.role === "admin"
                          ? colors.clay
                          : colors.sand,
                  },
                ]}
              />
              <View style={styles.copy}>
                <Text style={styles.name}>{person.displayName}</Text>
                <Text style={styles.role}>{roleLabel[person.role]}</Text>
                <Text style={styles.focus}>{person.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.section,
    overflow: "hidden",
  },
  content: {
    zIndex: 1,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(19, 33, 28, 0.14)",
  },
  avatar: {
    width: 64,
    height: 64,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 22,
    color: colors.ink,
  },
  role: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 14,
    color: colors.mint,
  },
  focus: {
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
    lineHeight: 20,
    color: colors.mute,
  },
});
