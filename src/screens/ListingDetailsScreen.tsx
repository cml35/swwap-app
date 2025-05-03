import React, { useState } from 'react';
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

type Condition = Item['condition'];

type ListingDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ListingDetails'>;
type ListingDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListingDetails'>;

export const ListingDetailsScreen = () => {
  const navigation = useNavigation<ListingDetailsScreenNavigationProp>();
  const route = useRoute<ListingDetailsScreenRouteProp>();
  const queryClient = useQueryClient();
  const { listingId } = route.params;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<Condition>('Good');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const { data: listing, isLoading, error } = useQuery<Item>({
    queryKey: ['listing', listingId],
    queryFn: () => listingService.getListingById(listingId),
  });

  React.useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description);
      setCondition(listing.condition);
      setTags(listing.tags);
    }
  }, [listing]);

  const updateListingMutation = useMutation({
    mutationFn: (data: Partial<Item>) => listingService.updateListing(listingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Listing updated successfully!',
        position: 'top',
        visibilityTime: 2000,
      });
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

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a listing title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    updateListingMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      condition,
      tags,
    });
  };

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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
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

          {/* Listing Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Listing Title</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter listing title"
                placeholderTextColor="#999"
                maxLength={100}
              />
            ) : (
              <Text style={styles.text}>{title}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your item"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.text}>{description}</Text>
            )}
          </View>

          {/* Condition */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Condition</Text>
            {isEditing ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={condition}
                  onValueChange={(value: Condition) => setCondition(value)}
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
              <Text style={styles.text}>{condition}</Text>
            )}
          </View>

          {/* Tags Section */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tags</Text>
            {isEditing ? (
              <>
                <View style={styles.tagInputContainer}>
                  <TextInput
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
                  {tags.map((tag, index) => (
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
                {tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  editButton: {
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
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
}); 