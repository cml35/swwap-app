import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, RefreshControl, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../services/listingService';
import { Item } from '../types';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type ListingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ListingsScreen = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<ListingsScreenNavigationProp>();

  const { data: listings, isLoading, error, refetch } = useQuery({
    queryKey: ['listings'],
    queryFn: listingService.getListings,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when the window regains focus
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const removeMutation = useMutation({
    mutationFn: (id: string) => {
      return listingService.removeListing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      Toast.show({
        type: 'success',
        text1: 'Listing removed successfully',
      });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to remove listing',
        text2: error.message,
      });
    },
  });

  const handleRemove = (id: string) => {
    if (Platform.OS === 'web') {
      // Use window.confirm for web
      const confirmed = window.confirm('Are you sure you want to remove this listing?');
      if (confirmed) {
        removeMutation.mutate(id);
      }
    } else {
      // Use React Native Alert for mobile
      Alert.alert(
        'Remove Listing',
        'Are you sure you want to remove this listing?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              console.log('ListingsScreen - Remove cancelled');
            },
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              console.log('ListingsScreen - Remove confirmed, calling mutation');
              removeMutation.mutate(id);
            },
          },
        ]
      );
    }
  };

  const renderListing = ({ item }: { item: Item }) => ( 
    <View style={styles.listingItem}>
      <TouchableOpacity
        style={styles.listingContent}
        onPress={() => navigation.navigate('ListingDetails', { listingId: item.id })}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.condition}>Condition: {item.condition}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => {
          console.log('ListingsScreen - Remove button pressed for item:', item.id);
          handleRemove(item.id);
        }}
      >
        <Ionicons name="close-circle" size={24} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <Text>Loading listings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error loading listings</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={listings}
        renderItem={renderListing}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
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
  listContainer: {
    padding: 16,
  },
  listingItem: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  listingContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  condition: {
    fontSize: 14,
    color: '#007AFF',
  },
  removeButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
}); 