import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native-paper';

export const AuthorizationScreen = () => {
	const {t} = useTranslation();

	return <Text>{t('test')}</Text>;
};
