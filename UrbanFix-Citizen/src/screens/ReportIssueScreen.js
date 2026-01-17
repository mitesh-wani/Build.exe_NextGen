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
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../services/firebase';

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
  const navigation = useNavigation();
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

      try {
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
          setAddress('Location detected');
        }
      } catch (geocodeErr) {
        console.log('Geocoding unavailable:', geocodeErr);
        setAddress('Location detected');
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
        'Report Submitted! ✅',
        'Thank you — your report has been sent to the authorities.',
        [
          {
            text: 'View My Reports',
            onPress: () => navigation.navigate('MyIssues'),
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
          isSelected && { 
            borderColor: cat.color, 
            backgroundColor: `${cat.color}15`,
            transform: [{ scale: 1.02 }],
          },
        ]}
        onPress={() => setSelectedCategory(cat.name)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.categoryIconWrapper,
          isSelected && { backgroundColor: `${cat.color}25` }
        ]}>
          <Ionicons name={cat.icon} size={28} color={isSelected ? cat.color : COLORS.gray[500]} />
        </View>
        <Text style={[styles.categoryName, isSelected && { color: cat.color, fontWeight: '700' }]}>
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
        activeOpacity={0.8}
      >
        <Text style={styles.priorityLabel}>{p.label}</Text>
        {isSelected && <Ionicons name="checkmark-circle" size={18} color={COLORS.white} style={{ marginLeft: 6 }} />}
      </TouchableOpacity>
    );
  };

  const isFormValid = selectedCategory && description.trim() && image && location;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Report Issue</Text>
            <Text style={styles.headerSubtitle}>Help improve your community</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Category */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Category</Text>
              <Text style={styles.requiredBadge}>Required</Text>
            </View>
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
            <Text style={styles.sectionLabel}>Title <Text style={styles.optionalText}>(optional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Pothole on Main Street"
              placeholderTextColor={COLORS.gray[400]}
              value={title}
              onChangeText={setTitle}
              maxLength={80}
            />
            <Text style={styles.charCount}>{title.length}/80</Text>
          </View>

          {/* Description */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.requiredBadge}>Required</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the issue in detail: what happened, when you noticed it, potential risks, etc."
              placeholderTextColor={COLORS.gray[400]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* Photo */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Photo Evidence</Text>
              <Text style={styles.requiredBadge}>Required</Text>
            </View>
            <TouchableOpacity style={styles.photoContainer} onPress={pickImage} activeOpacity={0.8}>
              {image ? (
                <>
                  <Image source={{ uri: image }} style={styles.photoPreview} />
                  <View style={styles.photoOverlay}>
                    <Ionicons name="camera" size={24} color={COLORS.white} />
                    <Text style={styles.photoOverlayText}>Tap to change</Text>
                  </View>
                </>
              ) : (
                <View style={styles.photoPlaceholder}>
                  <View style={styles.photoIconCircle}>
                    <Ionicons name="camera-outline" size={40} color={COLORS.primary} />
                  </View>
                  <Text style={styles.photoPlaceholderTitle}>Add Photo</Text>
                  <Text style={styles.photoPlaceholderText}>Take a picture or choose from gallery</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Location</Text>
            <View style={styles.locationBlock}>
              {locationLoading ? (
                <View style={styles.locationLoadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.locationLoadingText}>Getting your location...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.locationIconWrapper}>
                    <Ionicons name="location-sharp" size={24} color={COLORS.white} />
                  </View>
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.locationMain}>{address}</Text>
                    {location && (
                      <Text style={styles.locationCoords}>
                        {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    onPress={requestPermissionsAndGetLocation} 
                    disabled={locationLoading}
                    style={styles.refreshBtn}
                  >
                    <Ionicons name="refresh" size={22} color={COLORS.primary} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, !isFormValid && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading || !isFormValid}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Ionicons name="send" size={20} color={COLORS.white} />
                <Text style={styles.submitText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },

  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.white + 'DD',
    marginTop: 2,
  },

  sectionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.dark,
  },
  requiredBadge: {
    fontSize: SIZES.xs,
    color: COLORS.danger,
    fontWeight: '600',
    backgroundColor: COLORS.danger + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  optionalText: {
    fontSize: SIZES.sm,
    color: COLORS.gray[500],
    fontWeight: '400',
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
  },
  categoryIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  categoryName: {
    marginTop: SPACING.sm,
    fontSize: SIZES.xs,
    color: COLORS.gray[700],
    textAlign: 'center',
    fontWeight: '600',
  },

  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  priorityChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    opacity: 0.85,
  },
  priorityChipSelected: {
    opacity: 1,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  priorityLabel: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: SIZES.sm,
  },

  input: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: SIZES.md,
    color: COLORS.dark,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: SIZES.xs,
    color: COLORS.gray[500],
    textAlign: 'right',
    marginTop: SPACING.xs,
  },

  photoContainer: {
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    height: 240,
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  photoOverlayText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
  },
  photoIconCircle: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  photoPlaceholderTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  photoPlaceholderText: {
    color: COLORS.gray[500],
    fontSize: SIZES.sm,
    textAlign: 'center',
  },

  locationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  locationLoadingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  locationLoadingText: {
    fontSize: SIZES.md,
    color: COLORS.gray[600],
  },
  locationIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationMain: {
    fontSize: SIZES.md,
    color: COLORS.dark,
    fontWeight: '600',
  },
  locationCoords: {
    fontSize: SIZES.xs,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  submitBtn: {
    margin: SPACING.lg,
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitDisabled: {
    backgroundColor: COLORS.gray[400],
    shadowColor: 'transparent',
    elevation: 0,
  },
  submitText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});