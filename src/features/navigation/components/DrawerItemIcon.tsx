import React from 'react';

import {Icon} from 'react-native-paper';

const DrawerItemIcon = ({icon}: {icon: string}) => {
	return <Icon source={icon} size={20} />;
};

export const createDrawerIconFunction = (icon: string) => {
	return () => <DrawerItemIcon icon={icon} />;
};
