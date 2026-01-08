import { Stack } from 'expo-router';

export default function FoodDetailsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: "Food Details",
          headerShown: true,
          headerStyle: {
            backgroundColor: '#00b4d8',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
} 