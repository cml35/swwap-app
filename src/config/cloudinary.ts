import { Platform } from 'react-native';

// Upload function that works on both web and native
export const uploadToCloudinary = async (uri: string): Promise<string> => {
  try {
    console.log('Starting upload to Cloudinary...');
    console.log('Cloud Name:', process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME);
    console.log('Upload Preset:', process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    
    // Validate required environment variables
    if (!process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name is not configured');
    }
    if (!process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary upload preset is not configured');
    }
    
    const formData = new FormData();
    
    // Handle both web and native file formats
    if (Platform.OS === 'web') {
      console.log('Web platform detected, fetching file...');
      try {
        // For web, we need to fetch the file and create a blob
        const response = await fetch(uri);
        const blob = await response.blob();
        
        // Determine file type from the blob
        const fileType = blob.type || 'image/jpeg';
        const fileExtension = fileType.split('/')[1] || 'jpg';
        
        // Create a new File object from the blob
        const file = new File([blob], `upload.${fileExtension}`, { type: fileType });
        formData.append('file', file);
      } catch (error) {
        console.error('Error processing file for web:', error);
        throw error;
      }
    } else {
      console.log('Native platform detected, using URI directly...');
      // For native, we can use the uri directly
      const fileType = uri.toLowerCase().endsWith('.heic') || uri.toLowerCase().endsWith('.heif')
        ? 'image/heic'
        : uri.toLowerCase().endsWith('.png')
          ? 'image/png'
          : 'image/jpeg';
          
      formData.append('file', {
        uri,
        type: fileType,
        name: `upload.${fileType.split('/')[1]}`,
      } as any);
    }

    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    console.log('Using upload preset:', uploadPreset);
    formData.append('upload_preset', uploadPreset);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    console.log('Upload URL:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: Platform.OS === 'web' ? {
        'Accept': 'application/json',
      } : {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.error) {
      console.error('Cloudinary error:', data.error);
      throw new Error(data.error.message);
    }

    return data.secure_url;
  } catch (error) {
    console.error('Detailed upload error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}; 