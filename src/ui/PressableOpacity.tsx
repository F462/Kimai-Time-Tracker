import React from 'react';

import {Pressable, StyleProp, ViewStyle} from 'react-native';

export const PressableOpacity = ({
	style,
	...props
}: Omit<React.ComponentProps<typeof Pressable>, 'style'> & {style?: StyleProp<ViewStyle>}) => {
	return (
		<Pressable
			style={({pressed}) => [style, props.onPress && pressed ? {opacity: 0.25} : {}]}
			{...props}
		/>
	);
};
