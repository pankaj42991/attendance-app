import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Provider as PaperProvider } from "react-native-paper"
import { Home, Calendar, Profile, Settings } from "./screens"
import { Home as HomeIcon, Calendar as CalendarIcon, User, Settings as SettingsIcon } from "lucide-react-native"
import { AttendanceProvider } from "./context/AttendanceContext"
import { theme } from "./theme"

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 10,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => <HomeIcon size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={Calendar}
        options={{
          tabBarIcon: ({ color }) => <CalendarIcon size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ color }) => <SettingsIcon size={24} color={color} />,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AttendanceProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
              {/* Add other screens here that aren't part of the tab navigation */}
            </Stack.Navigator>
          </NavigationContainer>
        </AttendanceProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}

