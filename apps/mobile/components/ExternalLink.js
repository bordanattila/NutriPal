import { jsx as _jsx } from "react/jsx-runtime";
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
export function ExternalLink(props) {
    return (_jsx(Link, { target: "_blank", ...props, 
        // @ts-expect-error: External URLs are not typed.
        href: props.href, onPress: (e) => {
            if (Platform.OS !== 'web') {
                // Prevent the default behavior of linking to the default browser on native.
                e.preventDefault();
                // Open the link in an in-app browser.
                WebBrowser.openBrowserAsync(props.href);
            }
        } }));
}
