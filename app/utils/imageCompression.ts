import * as ImageManipulator from 'expo-image-manipulator';

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  format: 'jpeg',
};

export const compressImage = async (
  uri: string,
  options: CompressionOptions = {}
): Promise<string> => {
  const { maxWidth, maxHeight, quality, format } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat[format.toUpperCase()],
      }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original URI if compression fails
    return uri;
  }
}; 