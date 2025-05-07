import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../services/authService';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();

  const logoutMutation = useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      const result = await authService.logout();
      return result;
    },
    onSuccess: () => {
      logout();
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    },
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            try {
              logoutMutation.mutate();
            } catch (error) {
              console.error('Error calling mutation:', error);
            }
          },
        },
      ],
      { 
        cancelable: true,
        onDismiss: () => console.log('Alert dialog dismissed without selection')
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* User Info Section */}
        <View style={styles.section}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Text>
            </View>
            <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#333" style={styles.menuIcon} />
            <Text style={styles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton, logoutMutation.isPending && styles.buttonDisabled]} 
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <Ionicons name="log-out-outline" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  userInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
}); 