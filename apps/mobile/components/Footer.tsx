import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Footer = () => {
  const theme = useTheme();

  const socialLinks: Array<{ icon: keyof typeof Ionicons.glyphMap; url: string }> = [
    { icon: 'logo-instagram', url: 'https://www.instagram.com' },
    { icon: 'logo-facebook', url: 'https://www.facebook.com' },
    { icon: 'logo-twitter', url: 'https://twitter.com' },
    { icon: 'logo-youtube', url: 'https://www.youtube.com' },
  ];

  const handleSocialPress = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <LinearGradient
      // replicate "bg-gradient-to-br from-green-500 to-blue-400"
      colors={['#34D399', '#14B8A6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.socialContainer}>
        {socialLinks.map((link, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSocialPress(link.url)}
            style={styles.iconButton}
          >
            <Ionicons name={link.icon} size={24} color="white" />
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        onPress={() => handleSocialPress('https://www.fatsecret.com')}
        style={styles.poweredByContainer}
      >
        <Image
          source={{ uri: 'https://platform.fatsecret.com/api/static/images/powered_by_fatsecret.png' }}
          style={styles.poweredByImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconButton: {
    marginHorizontal: 12,
  },
  poweredByContainer: {
    marginTop: 8,
  },
  poweredByImage: {
    width: 130,
    height: 30,
  },
});

export default Footer; 