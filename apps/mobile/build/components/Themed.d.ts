/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */
import { Text as DefaultText, View as DefaultView } from 'react-native';
import Colors from '@/constants/Colors';
type ThemeProps = {
    lightColor?: string;
    darkColor?: string;
};
export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export declare function useThemeColor(props: {
    light?: string;
    dark?: string;
}, colorName: keyof typeof Colors.light & keyof typeof Colors.dark): string;
export declare function Text(props: TextProps): import("react/jsx-runtime").JSX.Element;
export declare function View(props: ViewProps): import("react/jsx-runtime").JSX.Element;
export {};
