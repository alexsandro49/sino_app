import { Tabs } from "expo-router";
import { ChartColumn, UserRound } from "lucide-react-native";

import { SinoBrand, SinoFonts } from "@/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: SinoBrand.primary,
        tabBarInactiveTintColor: SinoBrand.textTertiary,
        tabBarStyle: {
          backgroundColor: SinoBrand.background,
          borderTopColor: SinoBrand.divider,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: SinoFonts.medium,
          fontSize: 12,
        },
        sceneStyle: { backgroundColor: SinoBrand.background },
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
