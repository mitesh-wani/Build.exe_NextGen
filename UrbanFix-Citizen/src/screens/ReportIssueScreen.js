// src/screens/ReportIssueScreen.js
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebaseConfig';

// Theme imports
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  SIZES,
  ISSUE_CATEGORIES,
  ISSUE_STATUS,
  PRIORITY_LEVELS,
} from '../constants/theme';

export default function ReportIssueScreen() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Fetching location...');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await requestPermissionsAndGetLocation();
    })();
  }, []);

  const requestPermissionsAndGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location access is needed to report issues accurately.');
        setAddress('Location permission not granted');
        setLocationLoading(false);
        return;
      }

      setLocationLoading(true);
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (geocode) {
        const parts = [
          geocode.street,
          geocode.city,
          geocode.region,
          geocode.postalCode,
        ].filter(Boolean);
        setAddress(parts.join(', ') || 'Current location');
      } else {
        setAddress('Location detected, address unavailable');
      }
    } catch (err) {
      console.error('Location error:', err);
      setAddress('Could not fetch location');
    } finally {
      setLocationLoading(false);
    }
  };

  const pickImage = async () => {
    const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const camPerm = await ImagePicker.requestCameraPermissionsAsync();

    if (!libPerm.granted && !camPerm.granted) {
      Alert.alert('Permissions Needed', 'Camera & gallery access required for photos.');
      return;
    }

    Alert.alert('Add Photo', 'Choose source', [
      {
        text: 'Camera',
        onPress: async () => {
          const res = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.75,
          });
          if (!res.canceled) setImage(res.assets[0].uri);
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const res = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.75,
          });
          if (!res.canceled) setImage(res.assets[0].uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const uploadImageAsync = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `issues/${Date.now()}_${auth.currentUser?.uid || 'anon'}.jpg`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Required', 'Please select a category');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please provide a description');
      return;
    }
    if (!image) {
      Alert.alert('Required', 'Please attach a photo');
      return;
    }
    if (!location) {
      Alert.alert('Location Needed', 'We need your location to proceed');
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadImageAsync(image);

      const categoryObj = ISSUE_CATEGORIES.find(c => c.name === selectedCategory) || ISSUE_CATEGORIES[7];

      const issueData = {
        userId: auth.currentUser?.uid || null,
        category: selectedCategory,
        title: title.trim() || categoryObj.name,
        description: description.trim(),
        imageUrl,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        address,
        status: ISSUE_STATUS.PENDING.value,
        priority: selectedPriority,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'issues'), issueData);

      Alert.alert(
        'Report Submitted!',
        'Thank you — your report has been sent to the authorities.',
        [
          {
            text: 'View My Reports',
            onPress: () => router.push('/myissues'),
          },
          {
            text: 'Report Another',
            onPress: () => {
              // Reset form
              setSelectedCategory(null);
              setSelectedPriority('medium');
              setTitle('');
              setDescription('');
              setImage(null);
              requestPermissionsAndGetLocation();
            },
          },
          { text: 'Done', style: 'cancel' },
        ]
      );
    } catch (err) {
      console.error('Submit error:', err);
      Alert.alert('Submission Failed', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = (cat) => {
    const isSelected = selectedCategory === cat.name;
    return (
      <TouchableOpacity
        key={cat.id}
        style={[
          styles.categoryItem,
          isSelected && { borderColor: cat.color, backgroundColor: `${cat.color}15` },
        ]}
        onPress={() => setSelectedCategory(cat.name)}
      >
        <Ionicons name={cat.icon} size={32} color={isSelected ? cat.color : COLORS.gray[500]} />
        <Text style={[styles.categoryName, isSelected && { color: cat.color }]}>
          {cat.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPriorityItem = (key) => {
    const p = PRIORITY_LEVELS[key];
    const isSelected = selectedPriority === p.value;
    return (
      <TouchableOpacity
        key={p.value}
        style={[
          styles.priorityChip,
          { backgroundColor: p.color },
          isSelected && styles.priorityChipSelected,
        ]}
        onPress={() => setSelectedPriority(p.value)}
      >
        <Text style={styles.priorityLabel}>{p.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Report Issue</Text>
            <Text style={styles.headerSubtitle}>Help make your area better</Text>
          </View>
        </View>

        {/* Category */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Category *</Text>
          <View style={styles.categoryGrid}>
            {ISSUE_CATEGORIES.map(renderCategoryItem)}
          </View>
        </View>

        {/* Priority */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Priority Level</Text>
          <View style={styles.priorityContainer}>
            {Object.keys(PRIORITY_LEVELS).map(renderPriorityItem)}
          </View>
        </View>

        {/* Title */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Title (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Short summary (e.g. Pothole on Main Road)"
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />
        </View>

        {/* Description */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe what happened, when you noticed it, any risks..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Photo */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Photo *</Text>
          <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={48} color={COLORS.gray[400]} />
                <Text style={styles.photoPlaceholderText}>Tap to take or choose photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Location</Text>
          <View style={styles.locationBlock}>
            {locationLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="location-sharp" size={28} color={COLORS.primary} />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationMain}>{address}</Text>
                  {location && (
                    <Text style={styles.locationCoords}>
                      {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                    </Text>
                  )}
                </View>
              </>
            )}
            <TouchableOpacity onPress={requestPermissionsAndGetLocation} disabled={locationLoading}>
              <Ionicons name="refresh-circle" size={32} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (loading || !selectedCategory || !description.trim() || !image) && styles.submitDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="send" size={22} color={COLORS.white} />
              <Text style={styles.submitText}>Submit Report</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 56,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  backBtn: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: SIZES.md,
    color: COLORS.white + 'DD',
    marginTop: 4,
  },

  sectionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  categoryItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
  },
  categoryName: {
    marginTop: SPACING.sm,
    fontSize: SIZES.sm,
    color: COLORS.gray[700],
    textAlign: 'center',
    fontWeight: '500',
  },

  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  priorityChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 80,
    alignItems: 'center',
    opacity: 0.9,
  },
  priorityChipSelected: {
    opacity: 1,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  priorityLabel: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: SIZES.md - 2,
  },

  input: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: SIZES.lg,
    color: COLORS.dark,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  photoContainer: {
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    height: 220,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
  },
  photoPlaceholderText: {
    marginTop: SPACING.sm,
    color: COLORS.gray[500],
    fontSize: SIZES.md,
  },

  locationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationMain: {
    fontSize: SIZES.lg,
    color: COLORS.dark,
    fontWeight: '500',
  },
  locationCoords: {
    fontSize: SIZES.sm,
    color: COLORS.gray[600],
    marginTop: 4,
  },

  submitBtn: {
    margin: SPACING.lg,
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitDisabled: {
    backgroundColor: COLORS.gray[400],
    shadowColor: 'transparent',
  },
  submitText: {
    color: COLORS.white,
    fontSize: SIZES.xl,
    fontWeight: '700',
  },
});