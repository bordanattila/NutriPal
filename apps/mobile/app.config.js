module.exports = {
  expo: {
    name: "NutriPal Mobile",
    slug: "nutri-pal-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: [
      "**/*",
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.nutripal.app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.nutripal.app",
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    scheme: "nutripal",
    plugins: [
      "expo-barcode-scanner"
    ],
    extra: {
      api: {
        url: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.14:4000',
      },
      eas: {
        projectId: "your-project-id",
      },
    },
    env: {
      EXPO_PUBLIC_CLIENT_ID: process.env.REACT_APP_CLIENT_ID,
      EXPO_PUBLIC_CLIENT_SECRET: process.env.REACT_APP_CLIENT_SECRET,
    },
  },
};
