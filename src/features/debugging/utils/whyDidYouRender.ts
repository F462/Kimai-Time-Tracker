import React from 'react';

if (__DEV__) {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	const ReactRedux = require('react-redux');

	// These are library-internal components we don't care about
	const exclude = [/^InputLabel$/, /^Pressable$/];

	whyDidYouRender(React, {
		trackAllPureComponents: true,
		trackExtraHooks: [[ReactRedux, 'useSelector']],
		exclude,
	});
}
