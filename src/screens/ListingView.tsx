import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService';
import { Ionicons } from '@expo/vector-icons';

type ListingViewRouteProp = RouteProp<RootStackParamList, 'ListingView'>;

export const ListingView = () => {
  const route = useRoute<ListingViewRouteProp>();
  const { listingId } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => listingService.getListingById(listingId),
  });

  const handleSwwap = () => {
    console.log('Swwap button clicked for listing:', listingId);
    // TODO: Implement swwap functionality
  };

  const handlePreviousImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? listing.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === listing.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading listing...</Text>
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading listing</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Left Column - Listing Details */}
        <View style={styles.leftColumn}>
          {/* Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.titleText}>{listing.title}</Text>
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.text}>{listing.description}</Text>
          </View>

          {/* Condition */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Condition</Text>
            <Text style={styles.text}>{listing.condition}</Text>
          </View>

          {/* Tags */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagsContainer}>
              {listing.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Swwap Button */}
          <TouchableOpacity 
            style={styles.swwapButton}
            onPress={handleSwwap}
          >
            <Text style={styles.swwapButtonText}>Swwap</Text>
          </TouchableOpacity>
        </View>

        {/* Right Column - Image Gallery */}
        <View style={styles.rightColumn}>
          <View style={styles.imageGalleryContainer}>
            {listing.images && listing.images.length > 0 ? (
              <>
                <Text style={styles.label}>Images</Text>
                <View style={styles.imageNavigationContainer}>
                  <TouchableOpacity
                    style={styles.navigationButton}
                    onPress={handlePreviousImage}
                  >
                    <Ionicons name="chevron-back" size={32} color="#007AFF" />
                  </TouchableOpacity>
                  
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: listing.images[currentImageIndex] }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.navigationButton}
                    onPress={handleNextImage}
                  >
                    <Ionicons name="chevron-forward" size={32} color="#007AFF" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.imageCounter}>
                  {currentImageIndex + 1} / {listing.images.length}
                </Text>
              </>
            ) : (
              <Text style={styles.noImagesText}>No images available</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  leftColumn: {
    flex: 1,
    marginRight: 16,
  },
  rightColumn: {
    width: Dimensions.get('window').width * 0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#333',
    padding: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
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
  swwapButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  swwapButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageGalleryContainer: {
    marginBottom: 20,
  },
  imageNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
  },
  navigationButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    zIndex: 1,
  },
  imageWrapper: {
    width: Dimensions.get('window').width * 0.4,
    height: Dimensions.get('window').width * 0.4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imageCounter: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  noImagesText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    padding: 12,
  },
}); 