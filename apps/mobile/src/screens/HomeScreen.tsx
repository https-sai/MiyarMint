import { useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Hero } from "../components/Hero";
import { ProfilesSection } from "../components/ProfilesSection";
import { ClassroomsSection } from "../components/ClassroomsSection";
import { PortfoliosSection } from "../components/PortfoliosSection";
import { colors } from "../theme/tokens";
import type { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const profilesY = useRef(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false },
  );

  const handleExplore = () => {
    scrollRef.current?.scrollTo({ y: profilesY.current, animated: true });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <Hero
          onExplore={handleExplore}
          onSignIn={() => navigation.navigate("Auth")}
        />
        <View
          onLayout={(event) => {
            profilesY.current = event.nativeEvent.layout.y;
          }}
        >
          <ProfilesSection />
        </View>
        <ClassroomsSection />
        <PortfoliosSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
});
