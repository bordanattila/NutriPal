module.exports = {
  expo: {
    name: "NutriPal Mobile",
    slug: "nutri-pal-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
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
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    scheme: "nutripal",
    extra: {
      api: {
        url: process.env.EXPO_PUBLIC_API_URL,
      },
      eas: {
        projectId: "your-project-id",
      },
    },
  },
};
