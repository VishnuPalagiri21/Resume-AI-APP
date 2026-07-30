import { Platform } from 'react-native';

export const getFormDataFile = async (asset) => {
  if (!asset) return null;

  if (Platform.OS === 'web') {
    // 1. If expo-document-picker provided a File / Blob directly
    if (typeof window !== 'undefined') {
      if (asset.file && (asset.file instanceof File || asset.file instanceof Blob)) {
        return asset.file;
      }
      if (asset.output && asset.output[0] && (asset.output[0] instanceof File || asset.output[0] instanceof Blob)) {
        return asset.output[0];
      }
    }

    // 2. Otherwise convert blob:uri or data:uri via fetch
    try {
      if (asset.uri) {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const fileName = asset.name || 'resume.pdf';
        return new File([blob], fileName, {
          type: 'application/pdf',
        });
      }
    } catch (e) {
      console.warn('[fileUtils] Failed blob fetch conversion:', e);
    }
  }

  // Native Android / iOS
  return {
    uri: asset.uri,
    name: asset.name || 'resume.pdf',
    type: 'application/pdf',
  };
};
