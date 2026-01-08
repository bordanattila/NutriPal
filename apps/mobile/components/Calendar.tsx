import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DateTime } from 'luxon';

interface CalendarProps {
  value: DateTime;
  onChange: (date: DateTime) => void;
}

export default function Calendar({ value, onChange }: CalendarProps) {
  const goToPreviousDay = () => {
    onChange(value.minus({ days: 1 }));
  };

  const goToNextDay = () => {
    onChange(value.plus({ days: 1 }));
  };

  const goToToday = () => {
    onChange(DateTime.now());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousDay} style={styles.button}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToToday} style={styles.dateContainer}>
          <Text style={styles.date}>{value.toFormat('MMMM d, yyyy')}</Text>
          {!value.hasSame(DateTime.now(), 'day') && (
            <Text style={styles.todayHint}>(Tap for Today)</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={goToNextDay} style={styles.button}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    padding: 8,
  },
  dateContainer: {
    alignItems: 'center',
  },
  date: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  todayHint: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
}); 