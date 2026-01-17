// ==================== FILE 2: services/aiServices.js ====================
// AI Services using Gemini API for UrbanFix

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Replace with your actual key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Issue categories
const CATEGORIES = [
  'Road Damage',
  'Street Lighting',
  'Garbage/Sanitation',
  'Water Supply',
  'Drainage/Sewerage',
  'Public Property Damage',
  'Traffic Signal',
  'Illegal Construction',
  'Noise Pollution',
  'Other'
];

/**
 * Classify issue using Gemini AI based on description and image
 */
export const classifyIssue = async (description, imageBase64 = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    let prompt = `You are an AI assistant for a civic complaint platform. Analyze the following complaint and classify it into ONE of these categories:
${CATEGORIES.join(', ')}

Complaint Description: "${description}"

Respond ONLY with a JSON object in this exact format:
{
  "category": "category name from the list above",
  "priority": "low/medium/high/critical",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "confidence": 0.95,
  "reasoning": "brief explanation"
}

Priority Guidelines:
- Critical: Safety hazards, major infrastructure damage, health risks
- High: Significant inconvenience, moderate damage
- Medium: General complaints, minor issues
- Low: Cosmetic issues, suggestions

Be accurate and concise.`;

    let result;
    if (imageBase64) {
      // Analyze with image
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      };
      
      prompt += '\n\nAdditionally, analyze the provided image to better understand the issue.';
      result = await model.generateContent([prompt, imagePart]);
    } else {
      // Text only
      result = await model.generateContent(prompt);
    }
    
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      
      console.log('✅ AI Classification:', analysis);
      return {
        success: true,
        data: {
          category: analysis.category,
          priority: analysis.priority,
          keywords: analysis.keywords || [],
          confidence: analysis.confidence || 0.8,
          reasoning: analysis.reasoning || ''
        }
      };
    }
    
    throw new Error('Invalid AI response format');
    
  } catch (error) {
    console.error('❌ AI Classification Error:', error);
    return {
      success: false,
      error: error.message,
      // Fallback classification
      data: {
        category: 'Other',
        priority: 'medium',
        keywords: [],
        confidence: 0.5,
        reasoning: 'AI classification failed, using default'
      }
    };
  }
};

/**
 * Detect duplicate issues
 */
export const detectDuplicateIssues = async (newIssue, existingIssues) => {
  try {
    if (!existingIssues || existingIssues.length === 0) {
      return { success: true, isDuplicate: false, duplicateOf: null };
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Filter recent issues in similar location (within 500m)
    const nearbyIssues = existingIssues.filter(issue => {
      if (!issue.location || !newIssue.location) return false;
      
      const distance = calculateDistance(
        newIssue.location.lat,
        newIssue.location.lng,
        issue.location.lat,
        issue.location.lng
      );
      
      return distance < 0.5; // 500 meters
    });
    
    if (nearbyIssues.length === 0) {
      return { success: true, isDuplicate: false, duplicateOf: null };
    }
    
    // Prepare comparison for AI
    const comparisons = nearbyIssues.map((issue, idx) => 
      `Issue ${idx + 1}: ${issue.title} - ${issue.description}`
    ).join('\n');
    
    const prompt = `Analyze if this new complaint is a duplicate of any existing nearby complaints.

New Complaint:
Title: ${newIssue.title}
Description: ${newIssue.description}
Category: ${newIssue.category}

Existing Nearby Complaints:
${comparisons}

Respond ONLY with JSON:
{
  "isDuplicate": true/false,
  "duplicateOfIndex": number (0-based index, or null if not duplicate),
  "similarity": 0-100 (percentage),
  "reasoning": "brief explanation"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      
      if (analysis.isDuplicate && analysis.duplicateOfIndex !== null) {
        const duplicateIssue = nearbyIssues[analysis.duplicateOfIndex];
        console.log('✅ Duplicate detected:', duplicateIssue.id);
        
        return {
          success: true,
          isDuplicate: true,
          duplicateOf: duplicateIssue.id,
          similarity: analysis.similarity,
          reasoning: analysis.reasoning
        };
      }
    }
    
    return { success: true, isDuplicate: false, duplicateOf: null };
    
  } catch (error) {
    console.error('❌ Duplicate Detection Error:', error);
    return { success: true, isDuplicate: false, duplicateOf: null };
  }
};

/**
 * Generate automated response/suggestion
 */
export const generateIssueSuggestion = async (issueData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `As a civic assistant, provide helpful information about this complaint:

Category: ${issueData.category}
Description: ${issueData.description}
Priority: ${issueData.priority}

Provide:
1. Expected resolution timeframe
2. Which department typically handles this
3. Any immediate actions the citizen can take
4. Similar common issues

Respond in JSON format:
{
  "expectedTimeframe": "timeframe estimate",
  "department": "department name",
  "citizenActions": ["action1", "action2"],
  "relatedInfo": "helpful information"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const suggestion = JSON.parse(jsonMatch[0]);
      return { success: true, data: suggestion };
    }
    
    throw new Error('Invalid response format');
    
  } catch (error) {
    console.error('❌ Suggestion Generation Error:', error);
    return { success: false, error: error.message };
  }
};

// Helper: Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}


// ==================== FILE 3: scripts/seedData.js ====================
// Initial seed data for UrbanFix database

import { 
  collection, 
  addDoc, 
  setDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Seed Departments
 */
export const seedDepartments = async () => {
  try {
    console.log('🌱 Seeding departments...');
    
    const departments = [
      {
        name: 'Public Works Department',
        description: 'Handles road maintenance, infrastructure, and public property',
        categories: ['Road Damage', 'Public Property Damage', 'Illegal Construction'],
        officers: []
      },
      {
        name: 'Electricity Department',
        description: 'Manages street lighting and electrical infrastructure',
        categories: ['Street Lighting'],
        officers: []
      },
      {
        name: 'Sanitation Department',
        description: 'Responsible for waste management and cleanliness',
        categories: ['Garbage/Sanitation'],
        officers: []
      },
      {
        name: 'Water Supply Department',
        description: 'Manages water distribution and supply systems',
        categories: ['Water Supply'],
        officers: []
      },
      {
        name: 'Drainage Department',
        description: 'Handles sewerage and drainage systems',
        categories: ['Drainage/Sewerage'],
        officers: []
      },
      {
        name: 'Traffic Department',
        description: 'Manages traffic signals and road safety',
        categories: ['Traffic Signal'],
        officers: []
      },
      {
        name: 'Environment Department',
        description: 'Handles environmental and pollution complaints',
        categories: ['Noise Pollution'],
        officers: []
      }
    ];
    
    const departmentsRef = collection(db, 'departments');
    
    for (const dept of departments) {
      await addDoc(departmentsRef, {
        ...dept,
        createdAt: serverTimestamp()
      });
    }
    
    console.log('✅ Departments seeded successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding departments:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create sample authority user
 */
export const createSampleAuthority = async () => {
  try {
    console.log('🌱 Creating sample authority user...');
    
    const sampleAuthority = {
      uid: 'sample_authority_001',
      email: 'authority@urbanfix.com',
      displayName: 'Municipal Officer',
      phone: '+91-9876543210',
      role: 'authority',
      department: 'Public Works Department',
      location: {
        lat: 21.1458,
        lng: 79.0882,
        address: 'Nagpur, Maharashtra'
      },
      photoURL: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const userRef = doc(db, 'users', 'sample_authority_001');
    await setDoc(userRef, sampleAuthority);
    
    console.log('✅ Sample authority created');
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating sample authority:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create sample issues for testing
 */
export const createSampleIssues = async (userId) => {
  try {
    console.log('🌱 Creating sample issues...');
    
    const sampleIssues = [
      {
        userId: userId,
        userName: 'Test User',
        userPhone: '+91-1234567890',
        title: 'Large pothole on Main Street',
        description: 'There is a dangerous pothole near the traffic signal that needs immediate attention.',
        category: 'Road Damage',
        priority: 'high',
        status: 'pending',
        location: {
          lat: 21.1458,
          lng: 79.0882,
          address: 'Main Street, Nagpur'
        },
        photos: [],
        aiAnalysis: {
          detectedCategory: 'Road Damage',
          confidence: 0.95,
          keywords: ['pothole', 'road', 'damage']
        },
        assignedTo: null,
        assignedOfficerName: null,
        departmentId: null,
        resolutionProof: [],
        resolutionNote: '',
        isDuplicate: false,
        duplicateOf: null
      },
      {
        userId: userId,
        userName: 'Test User',
        userPhone: '+91-1234567890',
        title: 'Street light not working',
        description: 'Street light pole #45 has been non-functional for 3 days.',
        category: 'Street Lighting',
        priority: 'medium',
        status: 'pending',
        location: {
          lat: 21.1478,
          lng: 79.0892,
          address: 'Park Road, Nagpur'
        },
        photos: [],
        aiAnalysis: {
          detectedCategory: 'Street Lighting',
          confidence: 0.92,
          keywords: ['street light', 'electricity', 'lighting']
        },
        assignedTo: null,
        assignedOfficerName: null,
        departmentId: null,
        resolutionProof: [],
        resolutionNote: '',
        isDuplicate: false,
        duplicateOf: null
      }
    ];
    
    const issuesRef = collection(db, 'issues');
    
    for (const issue of sampleIssues) {
      await addDoc(issuesRef, {
        ...issue,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        resolvedAt: null
      });
    }
    
    console.log('✅ Sample issues created');
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating sample issues:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Run all seed functions
 */
export const seedDatabase = async (userId = null) => {
  try {
    console.log('🌱 Starting database seed...');
    
    await seedDepartments();
    await createSampleAuthority();
    
    if (userId) {
      await createSampleIssues(userId);
    }
    
    console.log('✅ Database seeded successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return { success: false, error: error.message };
  }
};