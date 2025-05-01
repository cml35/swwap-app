import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../services/authService';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();

  console.log('ProfileScreen rendered, user:', user?.email);

  const logoutMutation = useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      console.log('1. Mutation function starting');
      const result = await authService.logout();
      console.log('2. Mutation function completed');
      return result;
    },
    onMutate: () => {
      console.log('3. onMutate called');
    },
    onSuccess: () => {
      console.log('4. onSuccess called');
      // Call the logout function from AuthContext
      logout();
    },
    onError: (error) => {
      console.log('5. onError called with:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    },
  });

  const handleLogout = () => {
    console.log('A. handleLogout called');
    
    // Direct mutation test
    console.log('TEST: Attempting direct mutation');
    try {
      logoutMutation.mutate();
      console.log('TEST: Direct mutation called');
    } catch (error) {
      console.error('TEST: Direct mutation error:', error);
    }

    // Keep the Alert for user confirmation
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            console.log('B. Cancel pressed');
            console.log('B1. Alert dialog dismissed');
          },
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('C. Logout confirmed, calling mutation');
            try {
              console.log('C1. About to call mutation');
              logoutMutation.mutate();
              console.log('D. Mutation called successfully');
            } catch (error) {
              console.error('E. Error calling mutation:', error);
            }
          },
        },
      ],
      { 
        cancelable: true,
        onDismiss: () => console.log('Alert dialog dismissed without selection')
      }
    );
    console.log('A2. Alert dialog shown');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <TouchableOpacity 
            style={[styles.button, logoutMutation.isPending && styles.buttonDisabled]} 
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
          >
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 