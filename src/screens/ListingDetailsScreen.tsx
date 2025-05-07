import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../services/listingService';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Item } from '../types';
import Toast from 'react-native-toast-message';
import { ImageUploadZone } from '../components/ImageUploadZone';

type Condition = Item['condition'];

type ListingDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ListingDetails'>;
type ListingDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListingDetails'>;

export const ListingDetailsScreen = () => {
  const navigation = useNavigation<ListingDetailsScreenNavigationProp>();
  const route = useRoute<ListingDetailsScreenRouteProp>();
  const queryClient = useQueryClient();
  const { listingId } = route.params;

  const [isEditing, setIsEditing] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const tagInputRef = useRef<TextInput>(null);

  const { data: listing, isLoading, error } = useQuery<Item>({
    queryKey: ['listing', listingId],
    queryFn: () => listingService.getListingById(listingId),
  });

  const updateListingMutation = useMutation({
    mutationFn: (data: Partial<Item>) => listingService.updateListing(listingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Listing updated successfully!',
        position: 'top',
        visibilityTime: 2000,
      });
      setIsEditing(false);
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update listing. Please try again.',
        position: 'top',
        visibilityTime: 4000,
      });
    },
  });

  // Only update selectedImages when listing changes
  React.useEffect(() => {
    if (listing?.images) {
      setSelectedImages(listing.images);
    }
  }, [listing?.images]);

  const handleImagesSelected = useCallback((urls: string[]) => {
    setSelectedImages(urls);
  }, []);

  const handleSave = useCallback(() => {
    if (!listing) return;

    if (!listing.title.trim()) {
      Alert.alert('Error', 'Please enter a listing title');
      return;
    }

    if (!listing.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    updateListingMutation.mutate({
      ...listing,
      images: selectedImages,
    });
  }, [listing, selectedImages, updateListingMutation]);

  const handleAddTag = useCallback(() => {
    if (currentTag.trim() && !listing?.tags.includes(currentTag.trim())) {
      const newTags = [...(listing?.tags || []), currentTag.trim()];
      updateListingMutation.mutate({
        tags: newTags,
      });
      setCurrentTag('');
      tagInputRef.current?.focus();
    }
  }, [currentTag, listing?.tags, updateListingMutation]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    const newTags = (listing?.tags || []).filter(tag => tag !== tagToRemove);
    updateListingMutation.mutate({
      tags: newTags,
    });
  }, [listing?.tags, updateListingMutation]);

  const handlePreviousImage = useCallback(() => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? listing.images.length - 1 : prevIndex - 1
      );
    }
  }, [listing?.images]);

  const handleNextImage = useCallback(() => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === listing.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  }, [listing?.images]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading listing...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading listing</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Header with Edit/Save buttons */}
          <View style={styles.header}>
            {isEditing ? (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={updateListingMutation.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {updateListingMutation.isPending ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.contentContainer}>
            {/* Left Column - Listing Details */}
            <View style={styles.leftColumn}>
              {/* Listing Title */}
              <View style={styles.inputContainer}>
                {isEditing ? (
                  <>
                    <Text style={styles.label}>Listing Title</Text>
                    <TextInput
                      style={styles.input}
                      value={listing?.title}
                      onChangeText={(text) => updateListingMutation.mutate({ ...listing, title: text })}
                      placeholder="Enter listing title"
                      placeholderTextColor="#999"
                      maxLength={100}
                    />
                  </>
                ) : (
                  <Text style={styles.titleText}>{listing?.title}</Text>
                )}
              </View>

              {/* Description */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={listing?.description}
                    onChangeText={(text) => updateListingMutation.mutate({ ...listing, description: text })}
                    placeholder="Describe your item"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                ) : (
                  <Text style={styles.text}>{listing?.description}</Text>
                )}
              </View>

              {/* Condition */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Condition</Text>
                {isEditing ? (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={listing?.condition}
                      onValueChange={(value: Condition) => updateListingMutation.mutate({ ...listing, condition: value })}
                      style={styles.picker}
                      mode="dialog"
                      dropdownIconColor="#333"
                    >
                      <Picker.Item label="New" value="New" />
                      <Picker.Item label="Like New" value="Like New" />
                      <Picker.Item label="Good" value="Good" />
                      <Picker.Item label="Fair" value="Fair" />
                      <Picker.Item label="Poor" value="Poor" />
                    </Picker>
                  </View>
                ) : (
                  <Text style={styles.text}>{listing?.condition}</Text>
                )}
              </View>

              {/* Tags Section */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tags</Text>
                {isEditing ? (
                  <>
                    <View style={styles.tagInputContainer}>
                      <TextInput
                        ref={tagInputRef}
                        style={styles.tagInput}
                        value={currentTag}
                        onChangeText={setCurrentTag}
                        placeholder="Add a tag"
                        placeholderTextColor="#999"
                        onSubmitEditing={handleAddTag}
                      />
                      <TouchableOpacity
                        style={styles.addTagButton}
                        onPress={handleAddTag}
                      >
                        <Ionicons name="add-circle" size={24} color="#007AFF" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.tagsContainer}>
                      {listing?.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>#{tag}</Text>
                          <TouchableOpacity
                            onPress={() => handleRemoveTag(tag)}
                            style={styles.removeTagButton}
                          >
                            <Ionicons name="close-circle" size={16} color="#666" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <View style={styles.tagsContainer}>
                    {listing?.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Right Column - Image Gallery */}
            <View style={styles.rightColumn}>
              {isEditing ? (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Images</Text>
                  <ImageUploadZone
                    onImagesSelected={handleImagesSelected}
                    maxFiles={5}
                    initialImages={selectedImages}
                  />
                </View>
              ) : (
                <View style={styles.imageGalleryContainer}>
                  {listing?.images && listing.images.length > 0 ? (
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
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 0,
    paddingHorizontal: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#333',
    padding: 12,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    height: 50,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    margin: 0,
    padding: 0,
    backgroundColor: '#fff',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addTagButton: {
    padding: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
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
  removeTagButton: {
    marginLeft: 4,
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
  noImagesText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    padding: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
  },
  leftColumn: {
    flex: 1,
    marginRight: 16,
  },
  rightColumn: {
    width: Dimensions.get('window').width * 0.5,
  },
  imageGalleryWrapper: {
    display: 'none', // Remove the absolute positioning wrapper
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
}); 