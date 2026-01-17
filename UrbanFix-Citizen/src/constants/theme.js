// src/constants/theme.js

export const COLORS = {
  primary: '#2563eb',      // Blue
  secondary: '#7c3aed',    // Purple
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Orange
  danger: '#ef4444',       // Red
  dark: '#1f2937',         // Dark gray
  light: '#f3f4f6',        // Light gray
  white: '#ffffff',
  black: '#000000',
  gray: {
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const ISSUE_CATEGORIES = [
  { id: 1, name: 'Road Damage', icon: 'road', color: '#ef4444' },
  { id: 2, name: 'Streetlight', icon: 'lightbulb', color: '#f59e0b' },
  { id: 3, name: 'Garbage', icon: 'delete', color: '#10b981' },
  { id: 4, name: 'Water Supply', icon: 'water-drop', color: '#3b82f6' },
  { id: 5, name: 'Drainage', icon: 'water', color: '#8b5cf6' },
  { id: 6, name: 'Parks', icon: 'park', color: '#22c55e' },
  { id: 7, name: 'Traffic Signal', icon: 'traffic', color: '#f97316' },
  { id: 8, name: 'Other', icon: 'more-horiz', color: '#6b7280' },
];

export const ISSUE_STATUS = {
  PENDING: {
    value: 'pending',
    label: 'Pending',
    color: '#f59e0b',
    bgColor: '#fef3c7',
  },
  IN_PROGRESS: {
    value: 'in_progress',
    label: 'In Progress',
    color: '#3b82f6',
    bgColor: '#dbeafe',
  },
  RESOLVED: {
    value: 'resolved',
    label: 'Resolved',
    color: '#10b981',
    bgColor: '#d1fae5',
  },
  REJECTED: {
    value: 'rejected',
    label: 'Rejected',
    color: '#ef4444',
    bgColor: '#fee2e2',
  },
};

export const PRIORITY_LEVELS = {
  LOW: {
    value: 'low',
    label: 'Low',
    color: '#10b981',
  },
  MEDIUM: {
    value: 'medium',
    label: 'Medium',
    color: '#f59e0b',
  },
  HIGH: {
    value: 'high',
    label: 'High',
    color: '#ef4444',
  },
  URGENT: {
    value: 'urgent',
    label: 'Urgent',
    color: '#dc2626',
  },
};