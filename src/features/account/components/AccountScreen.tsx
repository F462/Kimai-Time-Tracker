import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Text, TextInput} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {apiKeyReceived} from '../context/accountSlice';
import {selectApiKey} from '../context/accountSelectors';

const styles = StyleSheet.create({
	mainContainer: {
		margin: 20
	},
	submitButton: {
		margin: 10
	}
})

export const AccountScreen = () => {
	const {t} = useTranslation();
	const dispatch = useDispatch();
	const [apiKey, setApiKey] = useState(useSelector(selectApiKey));

	return (
		<View style={styles.mainContainer}>
			<Text>{t('enterApiKey')}</Text>
			<TextInput value={apiKey} onChangeText={setApiKey} />
			<Button style={styles.submitButton} mode="contained" onPress={() => {
				dispatch(apiKeyReceived(apiKey));
			}}>{t('save')}</Button>
		</View>
	);
};
