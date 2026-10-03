import React, {useCallback} from 'react';
import {Pressable, StyleProp, ViewStyle} from 'react-native';

const pressedStyle = {opacity: 0.25};
const defaultStyle = {};

export const PressableOpacity = ({
	style,
	...props
}: Omit<React.ComponentProps<typeof Pressable>, 'style'> & {
	style?: StyleProp<ViewStyle>;
}) => {
	const hasPressHandler = props.onPress !== undefined;
	const styleResolver = useCallback(
		({pressed}: {pressed: boolean}) => [
			style,
			hasPressHandler && pressed ? pressedStyle : defaultStyle,
		],
		[style, hasPressHandler],
	);

	return <Pressable style={styleResolver} {...props} />;
};
