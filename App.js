import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera } from 'expo-camera';

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasLibraryPermission, setHasLibraryPermission] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [libraryImageUri, setLibraryImageUri] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasLibraryPermission(libraryStatus.status === 'granted');
    })();
  }, []);

  const openCamera = async () => {
    const { status } = await Camera.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take photos.');
      return;
    }
    const result = await Camera.takePictureAsync();
    setPhotoUri(result.uri);
  };

  const openImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Photo library access is needed to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const playPauseSound = async () => {
    if (sound === null) {
      // Replace this with the new sound URL
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/07272228059a3bfdd4e619d7f85407d1' } 
      );
      setSound(sound);
      setIsPlaying(true);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <LinearGradient
      colors={['#FF7F50', '#FFBF00', '#FF7F50']} 
      style={styles.container}
    >
      <Text style={styles.appTitle}>Sese App</Text>

      <TouchableOpacity style={styles.button} onPress={openCamera}>
        <Text style={styles.buttonText}>Take a Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={openImagePicker}>
        <Text style={styles.buttonText}>Pick a Photo from Gallery</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.image} />
      )}

      <TouchableOpacity style={styles.button} onPress={playPauseSound}>
        <Text style={styles.buttonText}>{isPlaying ? 'Pause Sound' : 'Play Sound'}</Text>
      </TouchableOpacity>

      {isPlaying && <Text style={styles.indicator}>Playing...</Text>}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#9FE2BF',
    marginBottom: 50,
    fontFamily: 'Cochin',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  button: {
    backgroundColor: '#9FE2BF', 
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#000000', 
    marginVertical: 10,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#0000000',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Cochin', 
  },
  image: {
    width: 250,
    height: 250,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF69B4', 
  },
  indicator: {
    marginTop: 20,
    fontSize: 18,
    color: '#FFD700',
    fontFamily: 'Cochin', 
  },
});