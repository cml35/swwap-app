import { uploadToCloudinary } from '../config/cloudinary';

export const cloudinaryService = {
  uploadImage: async (uri: string): Promise<string> => {
    try {
      const url = await uploadToCloudinary(uri);
      return url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload image');
    }
  },
}; 