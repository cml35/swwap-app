import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignUpScreen } from './src/screens/auth/SignUpScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AddListingScreen } from './src/screens/AddListingScreen';
import { ListingsScreen } from './src/screens/ListingsScreen';
import { ListingDetailsScreen } from './src/screens/ListingDetailsScreen';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AccountSettingsScreen } from './src/screens/AccountSettingsScreen';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Temporary HomeScreen component
const HomeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Home Screen</Text>
  </View>
);

const ExploreScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Explore Screen</Text>
  </View>
);

const MessagesScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Messages Screen</Text>
  </View>
);

const TabNavigator = () => {
  const navigation = useNavigation();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Explore':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Add':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          title: 'Explore',
        }}
      />
      <Tab.Screen 
        name="Add" 
        component={AddListingScreen}
        options={{
          title: 'Add',
          headerShown: true,
          headerTitle: 'Add Listing',
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          title: 'Messages',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  const linking = {
    prefixes: ['http://localhost:8081'],
    config: {
      screens: {
        Main: {
          path: '',
          screens: {
            Home: 'home',
            Explore: 'explore',
            Add: 'add',
            Messages: 'messages',
            Profile: 'profile',
          },
        },
        Settings: 'settings',
        AccountSettings: 'settings/account',
        ProfileListings: 'profile/listings',
        ListingDetails: 'listing/:listingId',
        Login: 'auth/login',
        SignUp: 'auth/signup',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ 
                title: 'Settings',
                headerShown: true,
                headerBackTitle: 'Profile',
              }}
            />
            <Stack.Screen 
              name="AccountSettings" 
              component={AccountSettingsScreen}
              options={{ 
                title: 'Account Settings',
                headerShown: true,
                headerBackTitle: 'Settings',
              }}
            />
            <Stack.Screen 
              name="ProfileListings" 
              component={ListingsScreen}
              options={{ 
                title: 'My Listings',
                headerShown: true,
                headerBackTitle: 'Profile',
              }}
            />
            <Stack.Screen 
              name="ListingDetails" 
              component={ListingDetailsScreen}
              options={{ 
                title: 'Listing Details',
                headerShown: true,
                headerBackTitle: 'Back',
                headerBackVisible: true,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                headerShown: true,
                title: 'Login',
              }}
            />
            <Stack.Screen 
              name="SignUp" 
              component={SignUpScreen}
              options={{
                headerShown: true,
                title: 'Sign Up',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Token expiration handler component
const TokenExpirationHandler = () => {
  const { logout } = useAuth();

  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Token expired, logging out...');
      logout();
      Toast.show({
        type: 'error',
        text1: 'Session Expired',
        text2: 'Please login again',
      });
    };

    // Listen for token expiration event
    window.addEventListener('auth:tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('auth:tokenExpired', handleTokenExpired);
    };
  }, [logout]);

  return null;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TokenExpirationHandler />
        <Navigation />
        <Toast />
      </AuthProvider>
    </QueryClientProvider>
  );
}
