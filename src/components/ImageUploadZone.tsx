import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { cloudinaryService } from '../services/cloudinaryService';
import { testCloudinaryConfig } from '../utils/testEnv';
import Toast from 'react-native-toast-message';

interface ImageUploadZoneProps {
  onImagesSelected: (urls: string[]) => void;
  maxFiles?: number;
  initialImages?: string[];
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  onImagesSelected,
  maxFiles = 5,
  initialImages = [],
}) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);

  // Test environment variables when component mounts
  React.useEffect(() => {
    testCloudinaryConfig();
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: maxFiles - previewUrls.length,
      });

      if (!result.canceled && result.assets.length > 0) {
        setIsUploading(true);
        const compressedImages = await Promise.all(
          result.assets.map(async (asset) => {
            const manipResult = await ImageManipulator.manipulateAsync(
              asset.uri,
              [{ resize: { width: 1080 } }],
              { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            return manipResult.uri;
          })
        );

        const uploadPromises = compressedImages.map((uri: string) => cloudinaryService.uploadImage(uri));
        const uploadedUrls = await Promise.all(uploadPromises);
        
        const newPreviewUrls = [...previewUrls, ...uploadedUrls];
        setPreviewUrls(newPreviewUrls);
        onImagesSelected(newPreviewUrls);

        // Show success toast for upload
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Images uploaded successfully!',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error('Error picking/uploading images:', error);
      Alert.alert('Error', 'Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [maxFiles, previewUrls, onImagesSelected]);

  const removeImage = useCallback((index: number) => {
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newPreviewUrls);
    onImagesSelected(newPreviewUrls);

    // Show success toast for removal
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Image removed successfully!',
      position: 'top',
      visibilityTime: 2000,
    });
  }, [previewUrls, onImagesSelected]);

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        {previewUrls.map((url, index) => (
          <View key={index} style={styles.previewWrapper}>
            <Image source={{ uri: url }} style={styles.preview} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {previewUrls.length < maxFiles && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImage}
            disabled={isUploading}
          >
            <Ionicons name="add" size={32} color="#007AFF" />
            <Text style={styles.uploadText}>
              {isUploading ? 'Uploading...' : 'Add Image'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.helperText}>
        {previewUrls.length} of {maxFiles} images selected
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  uploadButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#007AFF',
    marginTop: 4,
    fontSize: 12,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
}); 