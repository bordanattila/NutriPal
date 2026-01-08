import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Footer = () => {
  const handleFatSecretPress = async () => {
    const url = 'https://www.fatsecret.com';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleFatSecretPress}
        style={styles.poweredByContainer}
      >
        <Image
          source={{ uri: 'https://platform.fatsecret.com/api/static/images/powered_by_fatsecret.png' }}
          style={styles.poweredByImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    bottom: 25, // Position above the tab bar
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingBottom: 10,
  },
  poweredByContainer: {
    alignItems: 'center',
  },
  poweredByImage: {
    width: 130,
    height: 30,
  },
});

export default Footer; 