import React from 'react';

import {Pressable, ViewStyle} from 'react-native';

export const PressableOpacity = ({
	style,
	...props
}: Omit<React.ComponentProps<typeof Pressable>, 'style'> & {style?: ViewStyle}) => {
	return (
		<Pressable
			style={({pressed}) => [style, pressed ? {opacity: 0.25} : {}]}
			{...props}
		/>
	);
};
