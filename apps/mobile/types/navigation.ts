import { NavigationProp } from '@react-navigation/native';

export type AppStackParamList = {
  home: undefined;
  login: undefined;
  dashboard: undefined;
  signup: undefined;
};

export type AppStackNavigationProp = NavigationProp<AppStackParamList>;

export type HomeScreenProps = {
  navigation: AppStackNavigationProp;
};

export type LoginScreenProps = {
  navigation: AppStackNavigationProp;
};

export type DashboardScreenProps = {
  navigation: AppStackNavigationProp;
};

export type SignupScreenProps = {
  navigation: AppStackNavigationProp;
};
