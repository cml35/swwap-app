import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService';
import { Item } from '../types';
import { Ionicons } from '@expo/vector-icons';

export const ListingsScreen = () => {
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

  const renderListing = ({ item }: { item: Item }) => (
    <TouchableOpacity style={styles.listingCard}>
      <View style={styles.listingHeader}>
        <Text style={styles.listingTitle}>{item.title}</Text>
        <Text style={styles.listingCondition}>{item.condition}</Text>
      </View>
      <Text style={styles.listingDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.tagsContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
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
  listingCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  listingCondition: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  listingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
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