import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SearchBarProps {
  nameOfFood: string;
  setNameOfFood: (text: string) => void;
  handleSearch: () => void;
  clearSearch: () => void;
  error?: string | null;
}

export default function SearchBar({
  nameOfFood,
  setNameOfFood,
  handleSearch,
  clearSearch,
  error
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons 
          name="magnify" 
          size={24} 
          color="#0077b6"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Search for a food..."
          value={nameOfFood}
          onChangeText={setNameOfFood}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {nameOfFood.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <MaterialCommunityIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  errorText: {
    color: '#dc2626',
    marginTop: 8,
    fontSize: 14,
  },
}); 