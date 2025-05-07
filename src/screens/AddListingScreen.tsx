import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../services/listingService';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TabParamList } from '../types/navigation';
import { Item } from '../types';
import Toast from 'react-native-toast-message';
import { ImageUploadZone } from '../components/ImageUploadZone';

type Condition = Item['condition'];

type AddListingScreenNavigationProp = NativeStackNavigationProp<TabParamList, 'Add'>;

export const AddListingScreen = () => {
  const navigation = useNavigation<AddListingScreenNavigationProp>();
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();
  const tagInputRef = useRef<TextInput>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [formData, setFormData] = useState<Omit<Item, 'id' | 'createdAt' | 'userId'>>({
    title: '',
    description: '',
    condition: 'Good',
    tags: [],
    images: [],
    interestedIn: [],
    location: {
      latitude: 0,
      longitude: 0,
      address: '',
    },
  });

  const createListingMutation = useMutation({
    mutationFn: (data: Omit<Item, 'id' | 'createdAt' | 'userId'>) => listingService.createListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Listing created successfully!',
        position: 'top',
        visibilityTime: 2000,
      });
      navigation.goBack();
    },
    onError: (error) => {
      setIsSubmitting(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create listing. Please try again.',
        position: 'top',
        visibilityTime: 4000,
      });
    },
  });

  const handleTitleChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, title: text }));
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, description: text }));
  }, []);

  const handleConditionChange = useCallback((value: Condition) => {
    setFormData(prev => ({ ...prev, condition: value }));
  }, []);

  const handleAddTag = useCallback(() => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag('');
      tagInputRef.current?.focus();
    }
  }, [currentTag, formData.tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  }, []);

  const handleImagesSelected = useCallback((urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: urls,
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a listing title');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    setIsSubmitting(true);
    createListingMutation.mutate(formData);
  }, [formData, createListingMutation]);

  useEffect(() => {
    if (isFocused) {
      navigation.setOptions({
        headerShown: true,
        headerTitle: 'Add Listing',
        headerBackTitle: 'Back',
        headerBackVisible: true,
      });
    }
  }, [isFocused, navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Listing Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Listing Title</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={handleTitleChange}
              placeholder="Enter listing title"
              placeholderTextColor="#999"
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={handleDescriptionChange}
              placeholder="Describe your item"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Condition */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Condition</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.condition}
                onValueChange={handleConditionChange}
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
          </View>

          {/* Image Upload Zone */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Images</Text>
            <ImageUploadZone
              onImagesSelected={handleImagesSelected}
              maxFiles={5}
            />
          </View>

          {/* Tags Section */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tags</Text>
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
              {formData.tags.map((tag, index) => (
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
          </View>
        </View>
      </ScrollView>

      {/* Fixed Save Button at bottom */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Creating...' : 'Create Listing'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100, // Add padding to prevent content from being hidden behind the button
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
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
}); 