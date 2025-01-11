import React, {useState} from 'react';

import {Button, Text, TextInput} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {loginUser} from '../middleware/accountThunks';
import {selectIsUserLoggingIn} from 'src/features/appState/context/appStateSelectors';
import {selectServerUrl} from '../context/accountSelectors';
import {storeApiKey} from '../utils/accountPersistor';
import {useAppSelector} from 'src/features/data/context/store';

const styles = StyleSheet.create({
	mainContainer: {
		margin: 20
	},
	submitButton: {
		margin: 10
	}
});

export const AccountScreen = () => {
	const {t} = useTranslation();
	const dispatch = useDispatch();

	const isUserLoggingIn = useAppSelector(selectIsUserLoggingIn);

	const [apiKey, setApiKey] = useState('');
	const [serverUrl, setServerUrl] = useState(useSelector(selectServerUrl) ?? '');

	return (
		<View style={styles.mainContainer}>
			<Text>{t('enterServerUrl')}</Text>
			<TextInput value={serverUrl} onChangeText={setServerUrl} />
			<Text>{t('enterApiKey')}</Text>
			<TextInput value={apiKey} onChangeText={setApiKey} secureTextEntry />
			<Button style={styles.submitButton} mode="contained" loading={isUserLoggingIn} onPress={() => {
				storeApiKey(apiKey).then(() => {
					dispatch(loginUser({serverUrl}) as any);
				}).catch(console.error);
			}}>{t('save')}</Button>
		</View>
	);
};
