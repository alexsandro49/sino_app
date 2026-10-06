import { Tabs } from "expo-router";
import { ChartColumn, UserRound } from "lucide-react-native";

import { SinoFonts } from "@/constants/theme";
import { useColors } from "@/hooks/use-colors";

export default function TabsLayout() {
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: SinoFonts.medium,
          fontSize: 12,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="homeScreen"
        options={{
          title: "Carteira",
          tabBarIcon: ({ color, focused }) => (
            <ChartColumn color={color} size={21} strokeWidth={focused ? 1.8 : 1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <UserRound color={color} size={21} strokeWidth={focused ? 1.8 : 1.7} />
          ),
        }}
      />
    </Tabs>
  );
}
