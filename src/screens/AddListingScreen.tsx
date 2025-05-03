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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { listingService } from '../services/listingService';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Item } from '../types';

type Condition = Item['condition'];

type AddListingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Add'>;

export const AddListingScreen = () => {
  const navigation = useNavigation<AddListingScreenNavigationProp>();
  const [listingTitle, setListingTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<Condition>('Good');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const createListingMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      condition: Condition;
      tags: string[];
    }) => listingService.createListing({
      title: data.title,
      description: data.description,
      condition: data.condition,
      tags: data.tags,
      images: [], // TODO: Implement image upload
      interestedIn: [], // TODO: Implement interested in categories
      location: {
        latitude: 0, // TODO: Implement location
        longitude: 0,
        address: '',
      },
    }),
    onSuccess: () => {
      Alert.alert('Success', 'Listing created successfully!');
      navigation.goBack();
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
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
    if (!listingTitle.trim()) {
      Alert.alert('Error', 'Please enter a listing title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    createListingMutation.mutate({
      title: listingTitle.trim(),
      description: description.trim(),
      condition,
      tags,
    });
  };

  if (createListingMutation.isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Creating listing...</Text>
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
          {/* Listing Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Listing Title</Text>
            <TextInput
              style={styles.input}
              value={listingTitle}
              onChangeText={setListingTitle}
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
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your item"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Condition Dropdown */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Condition</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={condition}
                onValueChange={(value: Condition) => setCondition(value)}
                style={styles.picker}
                mode="dialog"
                dropdownIconColor="#333"
              >
                <Picker.Item 
                  label="New" 
                  value="New" 
                  style={{ 
                    height: 50,
                    fontSize: 16,
                    color: '#333'
                  }}
                />
                <Picker.Item 
                  label="Like New" 
                  value="Like New" 
                  style={{ 
                    height: 50,
                    fontSize: 16,
                    color: '#333'
                  }}
                />
                <Picker.Item 
                  label="Good" 
                  value="Good" 
                  style={{ 
                    height: 50,
                    fontSize: 16,
                    color: '#333'
                  }}
                />
                <Picker.Item 
                  label="Fair" 
                  value="Fair" 
                  style={{ 
                    height: 50,
                    fontSize: 16,
                    color: '#333'
                  }}
                />
                <Picker.Item 
                  label="Poor" 
                  value="Poor" 
                  style={{ 
                    height: 50,
                    fontSize: 16,
                    color: '#333'
                  }}
                />
              </Picker>
            </View>
          </View>

          {/* Image Upload Section */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Images</Text>
            <TouchableOpacity style={styles.imageUploadContainer}>
              <Ionicons name="cloud-upload-outline" size={32} color="#666" />
              <Text style={styles.uploadText}>Tap to upload images</Text>
              <Text style={styles.uploadSubtext}>Max 5 images</Text>
            </TouchableOpacity>
          </View>

          {/* Tags Section */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tags</Text>
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
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={createListingMutation.isPending}
          >
            <Text style={styles.saveButtonText}>Save Listing</Text>
          </TouchableOpacity>
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
  imageUploadContainer: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  uploadSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#999',
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
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
}); 