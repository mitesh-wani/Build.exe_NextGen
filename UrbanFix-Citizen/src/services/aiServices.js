// ==================== services/aiService.js ====================
// AI Services using Gemini API for UrbanFix
// Drop this file into your project's services folder

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with environment variable
// Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyA_dHfbJWaj-qDlguHcpwo8Cg9WCvOksZg';

let genAI = null;

try {
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized successfully');
  } else {
    console.warn('⚠️ Gemini API key not found. AI features will use fallback mode.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error);
}

// Issue categories for UrbanFix
export const CATEGORIES = [
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

// ==================== MAIN AI FUNCTIONS ====================

/**
 * Classify issue using Gemini AI based on description and optional image
 * @param {string} description - Issue description
 * @param {string|null} imageBase64 - Base64 encoded image (optional)
 * @returns {Promise<Object>} Classification result
 */
export const classifyIssue = async (description, imageBase64 = null) => {
  // If AI is not available, use fallback
  if (!genAI) {
    console.log('⚠️ Using fallback classification');
    return getFallbackClassification(description);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an AI assistant for UrbanFix, a civic complaint platform. Analyze the following complaint and classify it into ONE of these categories:
${CATEGORIES.join(', ')}

Complaint Description: "${description}"

Respond ONLY with a JSON object in this exact format (no markdown, no code blocks):
{
  "category": "category name from the list above",
  "priority": "low/medium/high/critical",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "confidence": 0.95,
  "reasoning": "brief explanation"
}

Priority Guidelines:
- Critical: Immediate safety hazards, major infrastructure damage, severe health risks
- High: Significant public inconvenience, moderate damage, urgent attention needed
- Medium: General complaints, minor issues, standard response time
- Low: Cosmetic issues, suggestions, non-urgent matters

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
      
      const enhancedPrompt = prompt + '\n\nAdditionally, analyze the provided image to better understand the issue and validate the classification.';
      result = await model.generateContent([enhancedPrompt, imagePart]);
    } else {
      // Text only analysis
      result = await model.generateContent(prompt);
    }
    
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse JSON response (handle potential markdown formatting)
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      
      console.log('✅ AI Classification successful:', analysis.category);
      
      return {
        success: true,
        data: {
          category: analysis.category,
          priority: analysis.priority,
          keywords: analysis.keywords || [],
          confidence: analysis.confidence || 0.8,
          reasoning: analysis.reasoning || 'AI classified the issue successfully'
        },
        isAI: true
      };
    }
    
    throw new Error('Invalid AI response format');
    
  } catch (error) {
    console.error('❌ AI Classification Error:', error.message);
    // Fallback to keyword-based classification
    return getFallbackClassification(description);
  }
};

/**
 * Detect duplicate issues using AI and location proximity
 * @param {Object} newIssue - New issue to check
 * @param {Array} existingIssues - Array of existing issues
 * @returns {Promise<Object>} Duplicate detection result
 */
export const detectDuplicateIssues = async (newIssue, existingIssues) => {
  if (!genAI) {
    console.log('⚠️ AI not available for duplicate detection');
    return { success: true, isDuplicate: false, duplicateOf: null };
  }

  try {
    if (!existingIssues || existingIssues.length === 0) {
      return { success: true, isDuplicate: false, duplicateOf: null };
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Filter nearby issues (within 500 meters)
    const nearbyIssues = existingIssues.filter(issue => {
      if (!issue.location || !newIssue.location) return false;
      
      const distance = calculateDistance(
        newIssue.location.lat,
        newIssue.location.lng,
        issue.location.lat,
        issue.location.lng
      );
      
      return distance < 0.5; // 500 meters radius
    });
    
    if (nearbyIssues.length === 0) {
      console.log('✅ No nearby issues found');
      return { success: true, isDuplicate: false, duplicateOf: null };
    }
    
    // Prepare comparison data for AI
    const comparisons = nearbyIssues.map((issue, idx) => 
      `Issue ${idx + 1} (ID: ${issue.id || 'unknown'}):
Title: ${issue.title}
Description: ${issue.description}
Category: ${issue.category}
Status: ${issue.status}
Distance: ${calculateDistance(newIssue.location.lat, newIssue.location.lng, issue.location.lat, issue.location.lng).toFixed(2)} km`
    ).join('\n\n');
    
    const prompt = `Analyze if this new complaint is a duplicate of any existing nearby complaints.

NEW COMPLAINT:
Title: ${newIssue.title}
Description: ${newIssue.description}
Category: ${newIssue.category}

EXISTING NEARBY COMPLAINTS (within 500m):
${comparisons}

Respond ONLY with JSON (no markdown):
{
  "isDuplicate": true/false,
  "duplicateOfIndex": number (0-based index, or null if not duplicate),
  "similarity": 0-100 (percentage similarity),
  "reasoning": "brief explanation of why it is or isn't a duplicate"
}

Consider: Same location, similar description, same category, matching keywords.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      
      if (analysis.isDuplicate && analysis.duplicateOfIndex !== null) {
        const duplicateIssue = nearbyIssues[analysis.duplicateOfIndex];
        console.log(`✅ Duplicate detected: ${duplicateIssue.id} (${analysis.similarity}% match)`);
        
        return {
          success: true,
          isDuplicate: true,
          duplicateOf: duplicateIssue.id,
          duplicateIssue: duplicateIssue,
          similarity: analysis.similarity,
          reasoning: analysis.reasoning
        };
      }
    }
    
    console.log('✅ No duplicates found');
    return { success: true, isDuplicate: false, duplicateOf: null };
    
  } catch (error) {
    console.error('❌ Duplicate Detection Error:', error.message);
    // On error, don't block issue submission
    return { success: true, isDuplicate: false, duplicateOf: null };
  }
};

/**
 * Generate helpful suggestions and information for an issue
 * @param {Object} issueData - Issue data object
 * @returns {Promise<Object>} Suggestion result
 */
export const generateIssueSuggestion = async (issueData) => {
  if (!genAI) {
    console.log('⚠️ AI not available for suggestions');
    return {
      success: false,
      error: 'AI service not available'
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `As a civic assistant for UrbanFix (Nagpur Municipal Corporation), provide helpful information about this complaint:

Category: ${issueData.category}
Description: ${issueData.description}
Priority: ${issueData.priority}
Location: ${issueData.location?.address || 'Not specified'}

Provide practical information:
1. Expected resolution timeframe (be realistic for Indian municipal corporations)
2. Which department typically handles this type of issue
3. Any immediate actions the citizen can take while waiting
4. Brief helpful information about similar issues

Respond in JSON format (no markdown):
{
  "expectedTimeframe": "realistic timeframe estimate",
  "department": "specific department name",
  "citizenActions": ["action1", "action2", "action3"],
  "relatedInfo": "brief helpful information"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const suggestion = JSON.parse(jsonMatch[0]);
      console.log('✅ AI suggestion generated');
      return { success: true, data: suggestion };
    }
    
    throw new Error('Invalid response format');
    
  } catch (error) {
    console.error('❌ Suggestion Generation Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Analyze issue image for additional context (if needed separately)
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<Object>} Image analysis result
 */
export const analyzeIssueImage = async (imageBase64) => {
  if (!genAI) {
    return { success: false, error: 'AI service not available' };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyze this civic infrastructure image and provide:
1. What type of issue is visible?
2. Severity assessment
3. Any safety concerns
4. Recommended category

Respond in JSON:
{
  "issueType": "description of what's visible",
  "severity": "low/medium/high/critical",
  "safetyConcerns": ["concern1", "concern2"],
  "suggestedCategory": "category name"
}`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return { success: true, data: JSON.parse(jsonMatch[0]) };
    }
    
    throw new Error('Invalid response format');
    
  } catch (error) {
    console.error('❌ Image Analysis Error:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Fallback classification when AI is unavailable (keyword-based)
 */
function getFallbackClassification(description) {
  const lowerDesc = description.toLowerCase();
  let category = 'Other';
  let priority = 'medium';
  const keywords = [];

  // Keyword-based classification rules
  if (lowerDesc.includes('pothole') || lowerDesc.includes('crack') || lowerDesc.includes('road damage')) {
    category = 'Road Damage';
    priority = 'high';
    keywords.push('road', 'damage', 'pothole');
  } else if (lowerDesc.includes('street light') || lowerDesc.includes('lamp') || lowerDesc.includes('light not working')) {
    category = 'Street Lighting';
    priority = 'medium';
    keywords.push('lighting', 'electricity', 'street light');
  } else if (lowerDesc.includes('garbage') || lowerDesc.includes('trash') || lowerDesc.includes('waste') || lowerDesc.includes('dirt')) {
    category = 'Garbage/Sanitation';
    priority = 'medium';
    keywords.push('garbage', 'sanitation', 'waste');
  } else if (lowerDesc.includes('water') || lowerDesc.includes('leak') || lowerDesc.includes('supply')) {
    category = 'Water Supply';
    priority = 'high';
    keywords.push('water', 'supply', 'leak');
  } else if (lowerDesc.includes('drain') || lowerDesc.includes('sewer') || lowerDesc.includes('overflow')) {
    category = 'Drainage/Sewerage';
    priority = 'high';
    keywords.push('drainage', 'sewer', 'overflow');
  } else if (lowerDesc.includes('traffic') || lowerDesc.includes('signal') || lowerDesc.includes('light')) {
    category = 'Traffic Signal';
    priority = 'medium';
    keywords.push('traffic', 'signal');
  } else if (lowerDesc.includes('noise') || lowerDesc.includes('loud') || lowerDesc.includes('pollution')) {
    category = 'Noise Pollution';
    priority = 'low';
    keywords.push('noise', 'pollution');
  } else if (lowerDesc.includes('construction') || lowerDesc.includes('illegal') || lowerDesc.includes('building')) {
    category = 'Illegal Construction';
    priority = 'medium';
    keywords.push('construction', 'illegal');
  } else if (lowerDesc.includes('park') || lowerDesc.includes('bench') || lowerDesc.includes('public property')) {
    category = 'Public Property Damage';
    priority = 'low';
    keywords.push('property', 'damage');
  }

  console.log('✅ Fallback classification:', category);

  return {
    success: true,
    data: {
      category,
      priority,
      keywords,
      confidence: 0.6,
      reasoning: 'Keyword-based classification (AI unavailable)'
    },
    isAI: false,
    isFallback: true
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns {number} Distance in kilometers
 */
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

/**
 * Convert image URI to base64 (for React Native)
 * @param {string} imageUri - Image URI from camera/gallery
 * @returns {Promise<string>} Base64 encoded image
 */
export const imageUriToBase64 = async (imageUri) => {
  try {
    // For React Native, use fetch to convert to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove data URL prefix to get pure base64
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

/**
 * Batch classify multiple issues (useful for migration/bulk operations)
 * @param {Array} issues - Array of issue objects
 * @returns {Promise<Array>} Array of classification results
 */
export const batchClassifyIssues = async (issues) => {
  const results = [];
  
  for (const issue of issues) {
    try {
      const result = await classifyIssue(issue.description);
      results.push({
        issueId: issue.id,
        ...result
      });
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error classifying issue ${issue.id}:`, error);
      results.push({
        issueId: issue.id,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Check if AI service is available
 * @returns {boolean}
 */
export const isAIAvailable = () => {
  return genAI !== null;
};

/**
 * Get AI service status
 * @returns {Object} Status information
 */
export const getAIStatus = () => {
  return {
    available: genAI !== null,
    apiKeyConfigured: GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE',
    model: 'gemini-1.5-flash',
    features: {
      classification: true,
      duplicateDetection: true,
      suggestions: true,
      imageAnalysis: true
    }
  };
};

// Export all functions
export default {
  classifyIssue,
  detectDuplicateIssues,
  generateIssueSuggestion,
  analyzeIssueImage,
  imageUriToBase64,
  batchClassifyIssues,
  isAIAvailable,
  getAIStatus,
  CATEGORIES
};