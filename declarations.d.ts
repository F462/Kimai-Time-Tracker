declare module '*.svg' {
	import React from 'react';
	import {SvgProps} from 'react-native-svg';
	const content: React.FC<SvgProps>;
	export default content;
}

declare module 'path';
declare module 'src/assets/license.txt';
declare module 'react-native-local-resource';
