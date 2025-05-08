import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, FlatList, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../services/authService';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useUserListings } from '../hooks/useUserListings';
import { Item } from '../types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();
  const { data: listings, isLoading, error } = useUserListings();

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

  const renderFeedItem = ({ item }: { item: Item }) => (
    <TouchableOpacity 
      style={styles.feedItem}
      onPress={() => navigation.navigate('ListingView', { listingId: item.id })}
    >
      <Image 
        source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }} 
        style={styles.feedImage} 
      />
      <View style={styles.listingInfo}>
        <Text style={styles.feedItemTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.listingStatus}>
          <Ionicons 
            name="time" 
            size={14} 
            color="#666"
          />
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading listings</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{listings?.length || 0}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{listings?.filter(l => l.status === 'active').length || 0}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{listings?.filter(l => l.status === 'pending_swwap').length || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={20} color="#333" />
          <Text style={styles.actionButtonText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ff4444" />
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Feed Content */}
      <FlatList
        data={listings}
        renderItem={renderFeedItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.feedContainer}
        columnWrapperStyle={styles.feedRow}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No listings yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#fff0f0',
  },
  logoutButtonText: {
    color: '#ff4444',
  },
  feedContainer: {
    padding: 4,
  },
  feedRow: {
    justifyContent: 'flex-start',
    gap: 4,
    paddingHorizontal: 4,
  },
  feedItem: {
    width: '32%',
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  feedImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },
  listingInfo: {
    padding: 8,
  },
  feedItemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  listingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  pendingStatus: {
    color: '#007AFF',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
  },
}); 