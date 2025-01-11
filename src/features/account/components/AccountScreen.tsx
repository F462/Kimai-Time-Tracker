import React, {useCallback, useState} from 'react';

import {Button, Text, TextInput} from 'react-native-paper';
import {Linking, StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import path from 'path';
import {useTranslation} from 'react-i18next';

import {BaseScreen} from 'src/ui/BaseScreen';
import {loginUser} from '../middleware/accountThunks';
import {selectIsUserLoggingIn} from 'src/features/appState/context/appStateSelectors';
import {selectServerUrl} from '../context/accountSelectors';
import {storeApiToken} from '../utils/accountPersistor';
import {useAppSelector} from 'src/features/data/context/store';

const styles = StyleSheet.create({
	inputContainer: {
		marginVertical: 10
	},
	submitButton: {
		marginHorizontal: 10,
		marginVertical: 20
	}
});

export const AccountScreen = () => {
	const {t} = useTranslation();
	const languageTag = useTranslation().i18n.language;
	const dispatch = useDispatch();

	const isUserLoggingIn = useAppSelector(selectIsUserLoggingIn);

	const [apiToken, setApiToken] = useState('');
	const [serverUrl, setServerUrl] = useState(useSelector(selectServerUrl) ?? '');

	const canApiTokenBeCreated = !!serverUrl;

	const onCreateApiToken = useCallback(() => {
		Linking.openURL(path.join(serverUrl, languageTag, 'profile/admin/api-token')).catch(console.error);
	}, [languageTag, serverUrl]);

	return (
		<BaseScreen>
			<View style={styles.inputContainer}>
				<Text>{t('enterServerUrl')}</Text>
				<TextInput value={serverUrl} onChangeText={setServerUrl} />
			</View>
			{canApiTokenBeCreated && <Button onPress={onCreateApiToken}>{t('createApiToken')}</Button>}
			<View style={styles.inputContainer}>
				<Text>{t('enterApiToken')}</Text>
				<TextInput value={apiToken} onChangeText={setApiToken} secureTextEntry />
			</View>
			<Button style={styles.submitButton} mode="contained" loading={isUserLoggingIn} onPress={() => {
				storeApiToken(apiToken).then(() => {
					dispatch(loginUser({serverUrl}) as any);
				}).catch(console.error);
			}}>{t('save')}</Button>
		</BaseScreen>
	);
};
