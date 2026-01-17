// ==================== FILE 1: services/firebaseServices.js ====================
// Complete Firebase Backend Services for UrbanFix

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';

// ==================== USER SERVICES ====================

export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      uid: userId,
      email: userData.email,
      displayName: userData.displayName || '',
      phone: userData.phone || '',
      role: userData.role || 'citizen', // 'citizen' or 'authority'
      department: userData.department || null,
      location: userData.location || null,
      photoURL: userData.photoURL || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ User profile created successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('✅ User profile updated');
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

// ==================== STORAGE SERVICES ====================

export const uploadIssuePhotos = async (photos) => {
  try {
    const uploadedUrls = [];
    
    for (const photo of photos) {
      // Handle both URI and base64
      let blob;
      if (photo.uri) {
        const response = await fetch(photo.uri);
        blob = await response.blob();
      } else if (photo.base64) {
        const response = await fetch(`data:image/jpeg;base64,${photo.base64}`);
        blob = await response.blob();
      }
      
      const filename = `issues/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      uploadedUrls.push(downloadUrl);
      console.log('✅ Photo uploaded:', downloadUrl);
    }
    
    return { success: true, urls: uploadedUrls };
  } catch (error) {
    console.error('❌ Error uploading photos:', error);
    return { success: false, error: error.message };
  }
};

export const uploadResolutionPhotos = async (photos) => {
  try {
    const uploadedUrls = [];
    
    for (const photo of photos) {
      const response = await fetch(photo.uri);
      const blob = await response.blob();
      const filename = `resolutions/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      uploadedUrls.push(downloadUrl);
    }
    
    return { success: true, urls: uploadedUrls };
  } catch (error) {
    console.error('❌ Error uploading resolution photos:', error);
    return { success: false, error: error.message };
  }
};

// ==================== ISSUE SERVICES ====================

export const createIssue = async (issueData) => {
  try {
    // First upload photos if they exist
    let photoUrls = [];
    if (issueData.photos && issueData.photos.length > 0) {
      const uploadResult = await uploadIssuePhotos(issueData.photos);
      if (!uploadResult.success) {
        throw new Error('Failed to upload photos');
      }
      photoUrls = uploadResult.urls;
    }

    // Create issue document
    const issuesRef = collection(db, 'issues');
    const issueDoc = {
      userId: issueData.userId,
      userName: issueData.userName,
      userPhone: issueData.userPhone || '',
      title: issueData.title,
      description: issueData.description,
      category: issueData.category || 'uncategorized',
      priority: issueData.priority || 'medium',
      status: 'pending',
      location: {
        lat: issueData.location.lat,
        lng: issueData.location.lng,
        address: issueData.location.address || ''
      },
      photos: photoUrls,
      aiAnalysis: issueData.aiAnalysis || null,
      assignedTo: null,
      assignedOfficerName: null,
      departmentId: null,
      resolutionProof: [],
      resolutionNote: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      resolvedAt: null,
      isDuplicate: false,
      duplicateOf: null
    };

    const docRef = await addDoc(issuesRef, issueDoc);
    console.log('✅ Issue created with ID:', docRef.id);
    
    // Create notification for the user
    await createNotification({
      userId: issueData.userId,
      issueId: docRef.id,
      title: 'Issue Reported Successfully',
      body: `Your issue "${issueData.title}" has been submitted and is pending review.`,
      type: 'issue_created'
    });
    
    return { success: true, issueId: docRef.id };
  } catch (error) {
    console.error('❌ Error creating issue:', error);
    return { success: false, error: error.message };
  }
};

export const getUserIssues = async (userId) => {
  try {
    const issuesRef = collection(db, 'issues');
    const q = query(
      issuesRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const issues = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      issues.push({ 
        id: doc.id, 
        ...data,
        // Convert Firestore Timestamps to JS Dates for easier handling
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        resolvedAt: data.resolvedAt?.toDate()
      });
    });
    
    console.log(`✅ Found ${issues.length} issues for user`);
    return { success: true, data: issues };
  } catch (error) {
    console.error('❌ Error getting user issues:', error);
    return { success: false, error: error.message };
  }
};

export const getAllIssues = async (filters = {}) => {
  try {
    const issuesRef = collection(db, 'issues');
    let constraints = [orderBy('createdAt', 'desc')];
    
    // Apply filters
    if (filters.status) {
      constraints.unshift(where('status', '==', filters.status));
    }
    if (filters.category) {
      constraints.unshift(where('category', '==', filters.category));
    }
    if (filters.priority) {
      constraints.unshift(where('priority', '==', filters.priority));
    }
    if (filters.departmentId) {
      constraints.unshift(where('departmentId', '==', filters.departmentId));
    }
    if (filters.assignedTo) {
      constraints.unshift(where('assignedTo', '==', filters.assignedTo));
    }
    
    const q = query(issuesRef, ...constraints);
    const querySnapshot = await getDocs(q);
    const issues = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      issues.push({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        resolvedAt: data.resolvedAt?.toDate()
      });
    });
    
    console.log(`✅ Found ${issues.length} issues`);
    return { success: true, data: issues };
  } catch (error) {
    console.error('❌ Error getting issues:', error);
    return { success: false, error: error.message };
  }
};

export const getIssueById = async (issueId) => {
  try {
    const issueRef = doc(db, 'issues', issueId);
    const issueSnap = await getDoc(issueRef);
    
    if (issueSnap.exists()) {
      const data = issueSnap.data();
      return { 
        success: true, 
        data: { 
          id: issueSnap.id, 
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          resolvedAt: data.resolvedAt?.toDate()
        } 
      };
    } else {
      return { success: false, error: 'Issue not found' };
    }
  } catch (error) {
    console.error('❌ Error getting issue:', error);
    return { success: false, error: error.message };
  }
};

export const updateIssueStatus = async (issueId, status, updates = {}) => {
  try {
    const issueRef = doc(db, 'issues', issueId);
    const updateData = {
      status,
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    if (status === 'resolved') {
      updateData.resolvedAt = serverTimestamp();
    }
    
    await updateDoc(issueRef, updateData);
    console.log(`✅ Issue ${issueId} status updated to ${status}`);
    
    // Get issue data for notification
    const issueSnap = await getDoc(issueRef);
    const issueData = issueSnap.data();
    
    // Notify user about status change
    await createNotification({
      userId: issueData.userId,
      issueId: issueId,
      title: `Issue Status Updated`,
      body: `Your issue "${issueData.title}" is now ${status}`,
      type: 'status_update'
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating issue status:', error);
    return { success: false, error: error.message };
  }
};

export const assignIssue = async (issueId, officerId, officerName, departmentId) => {
  try {
    const issueRef = doc(db, 'issues', issueId);
    await updateDoc(issueRef, {
      assignedTo: officerId,
      assignedOfficerName: officerName,
      departmentId: departmentId,
      status: 'assigned',
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Issue ${issueId} assigned to ${officerName}`);
    
    // Get issue data
    const issueSnap = await getDoc(issueRef);
    const issueData = issueSnap.data();
    
    // Notify citizen
    await createNotification({
      userId: issueData.userId,
      issueId: issueId,
      title: 'Issue Assigned',
      body: `Your issue has been assigned to ${officerName}`,
      type: 'assigned'
    });
    
    // Notify officer
    await createNotification({
      userId: officerId,
      issueId: issueId,
      title: 'New Issue Assigned',
      body: `You have been assigned: ${issueData.title}`,
      type: 'assigned'
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error assigning issue:', error);
    return { success: false, error: error.message };
  }
};

export const resolveIssue = async (issueId, resolutionData) => {
  try {
    // Upload resolution proof photos
    let proofUrls = [];
    if (resolutionData.photos && resolutionData.photos.length > 0) {
      const uploadResult = await uploadResolutionPhotos(resolutionData.photos);
      if (!uploadResult.success) {
        throw new Error('Failed to upload resolution photos');
      }
      proofUrls = uploadResult.urls;
    }
    
    // Update issue
    const issueRef = doc(db, 'issues', issueId);
    await updateDoc(issueRef, {
      resolutionProof: proofUrls,
      resolutionNote: resolutionData.note || '',
      status: 'resolved',
      resolvedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Issue ${issueId} resolved`);
    
    // Get issue data
    const issueSnap = await getDoc(issueRef);
    const issueData = issueSnap.data();
    
    // Notify user
    await createNotification({
      userId: issueData.userId,
      issueId: issueId,
      title: 'Issue Resolved! ✅',
      body: `Your issue "${issueData.title}" has been resolved`,
      type: 'resolved'
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error resolving issue:', error);
    return { success: false, error: error.message };
  }
};

// ==================== REAL-TIME LISTENERS ====================

export const subscribeToUserIssues = (userId, callback) => {
  const issuesRef = collection(db, 'issues');
  const q = query(
    issuesRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const issues = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      issues.push({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        resolvedAt: data.resolvedAt?.toDate()
      });
    });
    callback(issues);
  }, (error) => {
    console.error('❌ Error in issues listener:', error);
  });
};

export const subscribeToIssue = (issueId, callback) => {
  const issueRef = doc(db, 'issues', issueId);
  
  return onSnapshot(issueRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        resolvedAt: data.resolvedAt?.toDate()
      });
    }
  }, (error) => {
    console.error('❌ Error in issue listener:', error);
  });
};

export const subscribeToAllIssues = (callback, filters = {}) => {
  const issuesRef = collection(db, 'issues');
  let constraints = [orderBy('createdAt', 'desc')];
  
  if (filters.status) {
    constraints.unshift(where('status', '==', filters.status));
  }
  
  const q = query(issuesRef, ...constraints);
  
  return onSnapshot(q, (snapshot) => {
    const issues = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      issues.push({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        resolvedAt: data.resolvedAt?.toDate()
      });
    });
    callback(issues);
  }, (error) => {
    console.error('❌ Error in all issues listener:', error);
  });
};

// ==================== NOTIFICATION SERVICES ====================

export const createNotification = async (notificationData) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      userId: notificationData.userId,
      issueId: notificationData.issueId || null,
      title: notificationData.title,
      body: notificationData.body,
      type: notificationData.type, // 'issue_created', 'status_update', 'assigned', 'resolved'
      read: false,
      createdAt: serverTimestamp()
    });
    
    console.log('✅ Notification created');
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

export const getUserNotifications = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate()
      });
    });
    
    return { success: true, data: notifications };
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    return { success: false, error: error.message };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToUserNotifications = (userId, callback) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate()
      });
    });
    callback(notifications);
  }, (error) => {
    console.error('❌ Error in notifications listener:', error);
  });
};

// ==================== DEPARTMENT SERVICES ====================

export const getDepartments = async () => {
  try {
    const departmentsRef = collection(db, 'departments');
    const querySnapshot = await getDocs(departmentsRef);
    const departments = [];
    
    querySnapshot.forEach((doc) => {
      departments.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Found ${departments.length} departments`);
    return { success: true, data: departments };
  } catch (error) {
    console.error('❌ Error getting departments:', error);
    return { success: false, error: error.message };
  }
};

export const createDepartment = async (departmentData) => {
  try {
    const departmentsRef = collection(db, 'departments');
    const docRef = await addDoc(departmentsRef, {
      name: departmentData.name,
      description: departmentData.description || '',
      categories: departmentData.categories || [],
      officers: departmentData.officers || [],
      createdAt: serverTimestamp()
    });
    
    console.log('✅ Department created:', docRef.id);
    return { success: true, departmentId: docRef.id };
  } catch (error) {
    console.error('❌ Error creating department:', error);
    return { success: false, error: error.message };
  }
};

// ==================== ANALYTICS SERVICES ====================

export const getIssueStats = async () => {
  try {
    const issuesRef = collection(db, 'issues');
    const querySnapshot = await getDocs(issuesRef);
    
    const stats = {
      total: 0,
      pending: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
      byCategory: {},
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      recentIssues: []
    };
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      
      // Count by status
      if (data.status === 'pending') stats.pending++;
      else if (data.status === 'assigned') stats.assigned++;
      else if (data.status === 'in-progress') stats.inProgress++;
      else if (data.status === 'resolved') stats.resolved++;
      else if (data.status === 'rejected') stats.rejected++;
      
      // Count by category
      if (data.category) {
        stats.byCategory[data.category] = (stats.byCategory[data.category] || 0) + 1;
      }
      
      // Count by priority
      if (data.priority) {
        stats.byPriority[data.priority]++;
      }
    });
    
    console.log('✅ Stats calculated:', stats);
    return { success: true, data: stats };
  } catch (error) {
    console.error('❌ Error getting issue stats:', error);
    return { success: false, error: error.message };
  }
};

export const getHotspots = async () => {
  try {
    const issuesRef = collection(db, 'issues');
    const querySnapshot = await getDocs(issuesRef);
    
    const locationMap = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.location && data.location.address) {
        const address = data.location.address;
        locationMap[address] = (locationMap[address] || 0) + 1;
      }
    });
    
    // Convert to array and sort by count
    const hotspots = Object.entries(locationMap)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 hotspots
    
    return { success: true, data: hotspots };
  } catch (error) {
    console.error('❌ Error getting hotspots:', error);
    return { success: false, error: error.message };
  }
};