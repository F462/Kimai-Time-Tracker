import React from 'react';

import DeviceInfo from 'react-native-device-info';
import {Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import {BaseScreen} from 'src/ui/BaseScreen';

export const AboutScreen = () => {
	const {t} = useTranslation();

	return (
		<BaseScreen>
			<Text>{t('appVersion', {version: DeviceInfo.getReadableVersion()})}</Text>
		</BaseScreen>
	);
};
