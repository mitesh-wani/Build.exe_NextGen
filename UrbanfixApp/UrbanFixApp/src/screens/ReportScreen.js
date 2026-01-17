import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebaseConfig';

const CATEGORIES = [
  { id: 'pothole', label: 'Pothole', icon: 'warning' },
  { id: 'streetlight', label: 'Street Light', icon: 'bulb' },
  { id: 'garbage', label: 'Garbage', icon: 'trash' },
  { id: 'drainage', label: 'Drainage', icon: 'water' },
  { id: 'road_damage', label: 'Road Damage', icon: 'construct' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

export default function ReportIssueScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Getting location...');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to report issues');
        setAddress('Location permission denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      // Reverse geocoding to get address
      const addressResult = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (addressResult.length > 0) {
        const addr = addressResult[0];
        setAddress(
          `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`.trim()
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setAddress('Unable to get location');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted' && cameraStatus.status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera and gallery permissions are required');
      return;
    }

    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
            });

            if (!result.canceled) {
              setImage(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
            });

            if (!result.canceled) {
              setImage(result.assets[0].uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const filename = `issues/${Date.now()}_${auth.currentUser.uid}.jpg`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !description || !image || !location) {
      Alert.alert('Missing Information', 'Please fill all required fields and add a photo');
      return;
    }

    setLoading(true);

    try {
      // Upload image to Firebase Storage
      const imageUrl = await uploadImage(image);

      // Create issue document in Firestore
      const issueData = {
        userId: auth.currentUser.uid,
        category: selectedCategory,
        title: title || CATEGORIES.find(c => c.id === selectedCategory)?.label,
        description,
        imageUrl,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        address,
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'issues'), issueData);

      Alert.alert(
        'Success! ✅',
        'Your issue has been reported. Authorities will be notified.',
        [
          {
            text: 'View My Issues',
            onPress: () => router.push('/myissues'),
          },
          {
            text: 'Report Another',
            onPress: () => {
              setSelectedCategory(null);
              setTitle('');
              setDescription('');
              setImage(null);
              getCurrentLocation();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting issue:', error);
      Alert.alert('Error', 'Failed to submit issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Report an Issue</Text>
          <Text style={styles.headerSubtitle}>Help improve your community</Text>
        </View>
      </View>

      {/* Category Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Select Category *</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardSelected,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={32}
                color={selectedCategory === category.id ? '#2196F3' : '#666'}
              />
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === category.id && styles.categoryLabelSelected,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Title (Optional) */}
      <View style={styles.section}>
        <Text style={styles.label}>Title (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Brief title for the issue"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the issue in detail..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Photo */}
      <View style={styles.section}>
        <Text style={styles.label}>Photo *</Text>
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={48} color="#ccc" />
              <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.label}>Location</Text>
        <View style={styles.locationCard}>
          <Ionicons name="location" size={24} color="#2196F3" />
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>{address}</Text>
            {location && (
              <Text style={styles.coordinatesText}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={getCurrentLocation}>
            <Ionicons name="refresh" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  categoryCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
  },
  imagePickerButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#ccc',
    marginTop: 12,
    fontSize: 14,
  },
  locationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});