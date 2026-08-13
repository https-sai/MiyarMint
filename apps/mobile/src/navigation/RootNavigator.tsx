import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { AuthScreen } from "../screens/AuthScreen";
import { ClassroomScreen } from "../screens/ClassroomScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { JoinClassroomScreen } from "../screens/JoinClassroomScreen";
import { TradeScreen } from "../screens/TradeScreen";
import { colors } from "../theme/tokens";

export type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  Dashboard: undefined;
  Trade: undefined;
  Classroom: undefined;
  JoinClassroom: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.paper,
        }}
      >
        <ActivityIndicator color={colors.mint} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Trade" component={TradeScreen} />
            <Stack.Screen name="Classroom" component={ClassroomScreen} />
            <Stack.Screen name="JoinClassroom" component={JoinClassroomScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
