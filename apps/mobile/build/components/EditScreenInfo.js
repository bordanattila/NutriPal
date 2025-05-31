import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet } from 'react-native';
import { ExternalLink } from './ExternalLink';
import { MonoText } from './StyledText';
import { Text, View } from './Themed';
import Colors from '@/constants/Colors';
export default function EditScreenInfo({ path }) {
    return (_jsxs(View, { children: [_jsxs(View, { style: styles.getStartedContainer, children: [_jsx(Text, { style: styles.getStartedText, lightColor: "rgba(0,0,0,0.8)", darkColor: "rgba(255,255,255,0.8)", children: "Open up the code for this screen:" }), _jsx(View, { style: [styles.codeHighlightContainer, styles.homeScreenFilename], darkColor: "rgba(255,255,255,0.05)", lightColor: "rgba(0,0,0,0.05)", children: _jsx(MonoText, { children: path }) }), _jsx(Text, { style: styles.getStartedText, lightColor: "rgba(0,0,0,0.8)", darkColor: "rgba(255,255,255,0.8)", children: "Change any of the text, save the file, and your app will automatically update." })] }), _jsx(View, { style: styles.helpContainer, children: _jsx(ExternalLink, { style: styles.helpLink, href: "https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet", children: _jsx(Text, { style: styles.helpLinkText, lightColor: Colors.light.tint, children: "Tap here if your app doesn't automatically update after making changes" }) }) })] }));
}
const styles = StyleSheet.create({
    getStartedContainer: {
        alignItems: 'center',
        marginHorizontal: 50,
    },
    homeScreenFilename: {
        marginVertical: 7,
    },
    codeHighlightContainer: {
        borderRadius: 3,
        paddingHorizontal: 4,
    },
    getStartedText: {
        fontSize: 17,
        lineHeight: 24,
        textAlign: 'center',
    },
    helpContainer: {
        marginTop: 15,
        marginHorizontal: 20,
        alignItems: 'center',
    },
    helpLink: {
        paddingVertical: 15,
    },
    helpLinkText: {
        textAlign: 'center',
    },
});
