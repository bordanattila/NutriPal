import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Platform } from 'react-native';
import { Appbar, Menu, useTheme, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { mobileAuthService } from '../utils/authServiceMobile';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';

const Header = () => {
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const theme = useTheme();

  useEffect(() => {
    // Debug: Check if the image file exists
    const checkImage = async () => {
      try {
        const imageUri = Image.resolveAssetSource(require('../assets/images/NutripalLogo.jpg')).uri;
        console.log('Image URI:', imageUri);
      } catch (error) {
        console.error('Error resolving image:', error);
      }
    };
    checkImage();
  }, []);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleLogout = async () => {
    await mobileAuthService.logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: '#34D399'}}>
      <Appbar.Header style={styles.header} mode="small">
        <View style={styles.logoContainer}>
          {imageError ? (
            <Text variant="headlineMedium" style={styles.titleText}>NutriPal</Text>
          ) : (
            <Image
              source={Platform.select({
                ios: require('../assets/images/NutripalLogo.png'),
                android: require('../assets/images/NutripalLogo.png'),
                default: require('../assets/images/NutripalLogo.png'),
              })}
              style={styles.logo}
              resizeMode="contain"
              onError={(e) => {
                console.error('Error loading logo:', e.nativeEvent.error);
                setImageError(true);
              }}
              onLoad={() => {
                console.log('Logo loaded successfully');
              }}
            />
          )}
        </View>
        <View style={styles.rightContainer}>
          <Appbar.Action 
            icon="cog" 
            onPress={() => router.push({
              pathname: '/settings'
            } as any)} 
          />
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <Appbar.Action icon="account-circle" onPress={openMenu} />
            }
            anchorPosition="bottom"
          >
            <Menu.Item
              onPress={() => {
                closeMenu();
                router.push({
                  pathname: '/profile'
                } as any);
              }}
              title="Your Profile"
            />
            <Menu.Item
              onPress={() => {
                closeMenu();
                router.push({
                  pathname: '/settings'
                } as any);
              }}
              title="Settings"
            />
            <Menu.Item
              onPress={() => {
                closeMenu();
                handleLogout();
              }}
              title="Log out"
            />
          </Menu>
        </View>
      </Appbar.Header>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 4,
    alignItems: 'center',
    height:30,
    backgroundColor: '#34D399'
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingLeft: 5,
  },
  logo: {
    width: 120,
    height: 40,
  },
  titleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Header; 