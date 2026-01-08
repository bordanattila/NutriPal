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
      buildNumber: "1.0.0",
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
          NSExceptionDomains: {
            "192.168.1.14": {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSIncludesSubdomains: true,
            },
            "localhost": {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSIncludesSubdomains: true,
            },
          },
        },
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.nutripal.app",
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    scheme: "nutripal",
    plugins: [
      "expo-router",
      "expo-barcode-scanner"
    ],
    experiments: {
      typedRoutes: true,
    },
    newArchEnabled: true,
    extra: {
      api: {
        url: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.14:4000',
      },
      eas: {
        projectId: "your-project-id",
      },
      EXPO_PUBLIC_CLIENT_ID: process.env.REACT_APP_CLIENT_ID || process.env.EXPO_PUBLIC_CLIENT_ID,
      EXPO_PUBLIC_CLIENT_SECRET: process.env.REACT_APP_CLIENT_SECRET || process.env.EXPO_PUBLIC_CLIENT_SECRET,
    },
  },
};
