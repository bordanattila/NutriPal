import { jsx as _jsx } from "react/jsx-runtime";
import { Text } from './Themed';
export function MonoText(props) {
    return _jsx(Text, { ...props, style: [props.style, { fontFamily: 'SpaceMono' }] });
}
