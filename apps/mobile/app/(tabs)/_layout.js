import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props) {
    return _jsx(FontAwesome, { size: 28, style: { marginBottom: -3 }, ...props });
}
export default function TabLayout() {
    const colorScheme = useColorScheme();
    return (_jsxs(Tabs, { screenOptions: {
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            // Disable the static render of the header on web
            // to prevent a hydration error in React Navigation v6.
            headerShown: useClientOnlyValue(false, true),
        }, children: [_jsx(Tabs.Screen, { name: "index", options: {
                    title: 'Tab One',
                    tabBarIcon: ({ color }) => _jsx(TabBarIcon, { name: "code", color: color }),
                    headerRight: () => (_jsx(Link, { href: "/modal", asChild: true, children: _jsx(Pressable, { children: ({ pressed }) => (_jsx(FontAwesome, { name: "info-circle", size: 25, color: Colors[colorScheme ?? 'light'].text, style: { marginRight: 15, opacity: pressed ? 0.5 : 1 } })) }) })),
                } }), _jsx(Tabs.Screen, { name: "two", options: {
                    title: 'Tab Two',
                    tabBarIcon: ({ color }) => _jsx(TabBarIcon, { name: "code", color: color }),
                } })] }));
}
