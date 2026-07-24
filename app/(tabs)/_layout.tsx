import { Tabs } from "expo-router";
import { COLORS } from "../../constants";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerShadowVisible: false,
        headerTitleAlign: "center",
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "ホーム", tabBarLabel: "ホーム" }} />
      <Tabs.Screen name="history" options={{ title: "履歴", tabBarLabel: "履歴" }} />
      <Tabs.Screen name="stats" options={{ title: "統計", tabBarLabel: "統計" }} />
      <Tabs.Screen name="courses" options={{ title: "コース", tabBarLabel: "コース" }} />
    </Tabs>
  );
}
