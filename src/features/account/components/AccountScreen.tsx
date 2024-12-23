import React, {useState} from 'react';

import {Button, Text, TextInput} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {apiKeyReceived, serverUrlReceived} from '../context/accountActions';
import {selectApiKey, selectServerUrl} from '../context/accountSelectors';

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
	const [apiKey, setApiKey] = useState(useSelector(selectApiKey));
	const [serverUrl, setServerUrl] = useState(useSelector(selectServerUrl));

	return (
		<View style={styles.mainContainer}>
			<Text>{t('enterServerUrl')}</Text>
			<TextInput value={serverUrl} onChangeText={setServerUrl} />
			<Text>{t('enterApiKey')}</Text>
			<TextInput value={apiKey} onChangeText={setApiKey} />
			<Button style={styles.submitButton} mode="contained" onPress={() => {
				dispatch(serverUrlReceived(serverUrl));
				dispatch(apiKeyReceived(apiKey));
			}}>{t('save')}</Button>
		</View>
	);
};
