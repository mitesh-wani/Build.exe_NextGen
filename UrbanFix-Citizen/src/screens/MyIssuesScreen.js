// src/screens/MyIssuesScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function MyIssuesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Issues Screen - Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  text: {
    fontSize: 18,
    color: COLORS.dark,
  },
});
