import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { List, Switch, Text, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '@/components/Footer';

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00b4d8', '#0077b6', '#023e8a']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView style={styles.scrollView}>
            <Text variant="headlineMedium" style={styles.title}>Settings</Text>

            <List.Section style={styles.section}>
              <List.Subheader style={styles.subheader}>Notifications</List.Subheader>
              <List.Item
                title="Push Notifications"
                description="Receive push notifications for reminders and updates"
                right={() => (
                  <Switch
                    value={pushNotifications}
                    onValueChange={setPushNotifications}
                  />
                )}
                style={styles.listItem}
              />
              <Divider />
              <List.Item
                title="Email Notifications"
                description="Receive email notifications for weekly summaries"
                right={() => (
                  <Switch
                    value={emailNotifications}
                    onValueChange={setEmailNotifications}
                  />
                )}
                style={styles.listItem}
              />
            </List.Section>

            <List.Section style={styles.section}>
              <List.Subheader style={styles.subheader}>Appearance</List.Subheader>
              <List.Item
                title="Dark Mode"
                description="Use dark theme throughout the app"
                right={() => (
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                  />
                )}
                style={styles.listItem}
              />
            </List.Section>

            <List.Section style={styles.section}>
              <List.Subheader style={styles.subheader}>About</List.Subheader>
              <List.Item
                title="Version"
                description="1.0.0"
                left={props => <List.Icon {...props} icon="information" />}
                style={styles.listItem}
              />
              <Divider />
              <List.Item
                title="Terms of Service"
                left={props => <List.Icon {...props} icon="file-document" />}
                onPress={() => {/* TODO: Implement */}}
                style={styles.listItem}
              />
              <Divider />
              <List.Item
                title="Privacy Policy"
                left={props => <List.Icon {...props} icon="shield-account" />}
                onPress={() => {/* TODO: Implement */}}
                style={styles.listItem}
              />
            </List.Section>
          </ScrollView>
        </SafeAreaView>
        <Footer />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginVertical: 16,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  subheader: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listItem: {
    backgroundColor: 'transparent',
  },
}); 