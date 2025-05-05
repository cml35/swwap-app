export const testCloudinaryConfig = () => {
  console.log('Testing Cloudinary Configuration:');
  console.log('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME:', process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME);
  console.log('EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET:', process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  
  if (!process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    console.error('Cloudinary Cloud Name is not set!');
  }
  if (!process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
    console.error('Cloudinary Upload Preset is not set!');
  }
}; 