// src/services/firebaseServices.js
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

/**
 * Safely convert Firestore timestamp to JavaScript Date
 */
const convertTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  if (timestamp instanceof Date) return timestamp;
  
  if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
};

/**
 * Transform Firestore document to app-friendly format
 */
const transformIssueData = (doc) => {
  const data = doc.data();
  
  return {
    id: doc.id,
    userId: data.userId || null,
    userName: data.userName || 'Anonymous',
    userPhone: data.userPhone || '',
    title: data.title || data.category || 'Untitled',
    description: data.description || '',
    category: data.category || 'General',
    priority: data.priority || 'medium',
    status: data.status || 'pending',
    
    // Handle location - support both formats
    location: data.location ? {
      lat: data.location.lat || data.latitude || 0,
      lng: data.location.lng || data.longitude || 0,
      address: data.location.address || data.address || 'Location shared'
    } : null,
    
    // Handle photos
    photos: data.photos || (data.imageUrl ? [data.imageUrl] : []),
    
    // Optional fields
    assignedTo: data.assignedTo || null,
    assignedOfficerName: data.assignedOfficerName || null,
    aiAnalysis: data.aiAnalysis || null,
    resolutionProof: data.resolutionProof || [],
    resolutionNote: data.resolutionNote || null,
    
    // Convert timestamps
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    resolvedAt: convertTimestamp(data.resolvedAt),
    assignedAt: convertTimestamp(data.assignedAt),
  };
};

/**
 * Upload photo to Firebase Storage
 */
const uploadPhoto = async (uri, folder = 'issues') => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log('✅ Photo uploaded:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('❌ Photo upload error:', error);
    throw new Error('Failed to upload photo');
  }
};

// ============================================
// 📝 ISSUE CRUD OPERATIONS
// ============================================

/**
 * Create a new issue
 */
export const createIssue = async (issueData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Upload photos if provided
    let photoUrls = [];
    if (issueData.photos && issueData.photos.length > 0) {
      console.log('📤 Uploading photos...');
      for (const photo of issueData.photos) {
        if (photo.uri) {
          const url = await uploadPhoto(photo.uri);
          photoUrls.push(url);
        } else if (typeof photo === 'string') {
          photoUrls.push(photo);
        }
      }
    }

    // Prepare issue document
    const issueDoc = {
      userId: userId,
      userName: issueData.userName || auth.currentUser?.displayName || 'Anonymous',
      userPhone: issueData.userPhone || '',
      title: issueData.title || issueData.category || 'Untitled',
      description: issueData.description || '',
      category: issueData.category || 'General',
      priority: issueData.priority || 'medium',
      status: 'pending',
      
      // Location
      location: issueData.location || null,
      
      // Photos
      photos: photoUrls,
      
      // AI analysis (if provided)
      aiAnalysis: issueData.aiAnalysis || null,
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'issues'), issueDoc);
    console.log('✅ Issue created with ID:', docRef.id);

    // Create notification for user
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: userId,
        issueId: docRef.id,
        type: 'issue_created',
        title: 'Report Submitted',
        message: `Your report about "${issueDoc.category}" has been submitted successfully.`,
        read: false,
        createdAt: serverTimestamp(),
      });
      console.log('✅ Notification created');
    } catch (notifError) {
      console.error('⚠️ Notification creation failed:', notifError);
    }

    return {
      success: true,
      issueId: docRef.id,
    };
  } catch (error) {
    console.error('❌ Error creating issue:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get issue by ID
 */
export const getIssueById = async (issueId) => {
  try {
    const docRef = doc(db, 'issues', issueId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'Issue not found',
      };
    }

    return {
      success: true,
      data: transformIssueData(docSnap),
    };
  } catch (error) {
    console.error('❌ Error fetching issue:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get all issues for a specific user
 */
export const getUserIssues = async (userId) => {
  try {
    const q = query(
      collection(db, 'issues'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const issues = querySnapshot.docs.map(doc => transformIssueData(doc));

    console.log(`✅ Fetched ${issues.length} issues for user`);
    return {
      success: true,
      data: issues,
    };
  } catch (error) {
    console.error('❌ Error getting user issues:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * Get all issues (for admin/map view)
 */
export const getAllIssues = async () => {
  try {
    const q = query(
      collection(db, 'issues'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const issues = querySnapshot.docs.map(doc => transformIssueData(doc));

    console.log(`✅ Fetched ${issues.length} total issues`);
    return {
      success: true,
      data: issues,
    };
  } catch (error) {
    console.error('❌ Error fetching issues:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * Update issue status (for authorities)
 */
export const updateIssueStatus = async (issueId, status, resolutionData = {}) => {
  try {
    const updateData = {
      status: status,
      updatedAt: serverTimestamp(),
    };

    // If resolved, add resolution data
    if (status === 'resolved') {
      updateData.resolvedAt = serverTimestamp();
      if (resolutionData.note) {
        updateData.resolutionNote = resolutionData.note;
      }
      if (resolutionData.photos) {
        updateData.resolutionProof = resolutionData.photos;
      }
    }

    // If assigned, add assignment data
    if (status === 'assigned' && resolutionData.assignedTo) {
      updateData.assignedTo = resolutionData.assignedTo;
      updateData.assignedOfficerName = resolutionData.assignedOfficerName || null;
      updateData.assignedAt = serverTimestamp();
    }

    const docRef = doc(db, 'issues', issueId);
    await updateDoc(docRef, updateData);

    console.log('✅ Issue status updated:', status);
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating issue status:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================
// 🔄 REAL-TIME LISTENERS
// ============================================

/**
 * Subscribe to a specific issue's updates
 */
export const subscribeToIssue = (issueId, callback) => {
  try {
    const docRef = doc(db, 'issues', issueId);
    
    const unsubscribe = onSnapshot(docRef, 
      (doc) => {
        if (doc.exists()) {
          callback(transformIssueData(doc));
        }
      },
      (error) => {
        console.error('❌ Error in issue subscription:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up issue subscription:', error);
    return null;
  }
};

/**
 * Subscribe to user's issues
 */
export const subscribeToUserIssues = (userId, callback) => {
  try {
    const q = query(
      collection(db, 'issues'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const issues = snapshot.docs.map(doc => transformIssueData(doc));
        callback(issues);
      },
      (error) => {
        console.error('❌ Error in user issues subscription:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up user issues subscription:', error);
    return null;
  }
};

/**
 * Subscribe to all issues (for map/admin)
 */
export const subscribeToAllIssues = (callback) => {
  try {
    const q = query(
      collection(db, 'issues'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const issues = snapshot.docs.map(doc => transformIssueData(doc));
        callback(issues);
      },
      (error) => {
        console.error('❌ Error in all issues subscription:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up all issues subscription:', error);
    return null;
  }
};

// ============================================
// 👤 USER PROFILE OPERATIONS
// ============================================

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: 'User profile not found',
      };
    }

    const data = docSnap.data();
    return {
      success: true,
      data: {
        id: docSnap.id,
        email: data.email || '',
        displayName: data.name || data.displayName || 'User',
        phone: data.phone || '',
        role: data.role || 'citizen',
        createdAt: convertTimestamp(data.createdAt),
      },
    };
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ User profile updated');
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================
// 🔔 NOTIFICATION OPERATIONS
// ============================================

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
    }));

    return {
      success: true,
      data: notifications,
    };
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, {
      read: true,
      readAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Subscribe to user notifications
 */
export const subscribeToUserNotifications = (userId, callback) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: convertTimestamp(doc.data().createdAt),
        }));
        callback(notifications);
      },
      (error) => {
        console.error('❌ Error in notifications subscription:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up notifications subscription:', error);
    return null;
  }
};

export default {
  // Issue operations
  createIssue,
  getIssueById,
  getUserIssues,
  getAllIssues,
  updateIssueStatus,
  
  // Real-time subscriptions
  subscribeToIssue,
  subscribeToUserIssues,
  subscribeToAllIssues,
  
  // User operations
  getUserProfile,
  updateUserProfile,
  
  // Notification operations
  getUserNotifications,
  markNotificationAsRead,
  subscribeToUserNotifications,
};