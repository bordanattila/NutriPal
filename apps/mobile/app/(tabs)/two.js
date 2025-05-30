import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
export default function TabTwoScreen() {
    return (_jsxs(View, { style: styles.container, children: [_jsx(Text, { style: styles.title, children: "Tab Two" }), _jsx(View, { style: styles.separator, lightColor: "#eee", darkColor: "rgba(255,255,255,0.1)" }), _jsx(EditScreenInfo, { path: "app/(tabs)/two.tsx" })] }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});
