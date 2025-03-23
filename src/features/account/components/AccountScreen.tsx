import React, {useCallback, useState} from 'react';

import {Button, Text, TextInput, useTheme} from 'react-native-paper';
import {Linking, StyleSheet, View} from 'react-native';
import {FileLogger} from 'react-native-file-logger';
import path from 'path';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {loginUser, logoutUser} from '../middleware/accountThunks';
import {removeApiToken, storeApiToken} from '../utils/accountPersistor';
import {
	selectIsUserLoggedIn,
	selectServerUrl
} from '../context/accountSelectors';
import {
	selectIsUserLoggingIn,
	selectIsUserLoggingOut
} from 'src/features/appState/context/appStateSelectors';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {BaseScreen} from 'src/ui/BaseScreen';
import {useStyle} from 'src/features/theming/utils/useStyle';

const styles = StyleSheet.create({
	inputContainer: {
		marginVertical: 10
	},
	actionButton: {
		marginHorizontal: 10,
		marginVertical: 20
	},
	spacer: {
		flex: 1
	}
});

export const AccountScreen = () => {
	const {t} = useTranslation();
	const theme = useTheme();
	const languageTag = useTranslation().i18n.language;
	const dispatch = useAppDispatch();

	const isUserLoggingIn = useAppSelector(selectIsUserLoggingIn);
	const isUserLoggingOut = useAppSelector(selectIsUserLoggingOut);

	const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);

	const [apiToken, setApiToken] = useState('');
	const [serverUrl, setServerUrl] = useState(
		useSelector(selectServerUrl) ?? ''
	);

	const canApiTokenBeCreated = !!serverUrl;

	const onCreateApiToken = useCallback(() => {
		Linking.openURL(
			path.join(serverUrl, languageTag, 'profile/admin/api-token')
		).catch(FileLogger.error);
	}, [languageTag, serverUrl]);

	const dynamicStyles = useStyle(
		() => ({
			logoutButton: {
				backgroundColor: theme.colors.error
			}
		}),
		[theme.colors.error]
	);

	return (
		<BaseScreen>
			<View style={styles.inputContainer}>
				<Text>{t('enterServerUrl')}</Text>
				<TextInput value={serverUrl} onChangeText={setServerUrl} />
			</View>
			{canApiTokenBeCreated && (
				<Button onPress={onCreateApiToken}>{t('createApiToken')}</Button>
			)}
			<View style={styles.inputContainer}>
				<Text>{t('enterApiToken')}</Text>
				<TextInput
					value={apiToken}
					onChangeText={setApiToken}
					secureTextEntry
				/>
			</View>
			<Button
				style={styles.actionButton}
				mode="contained"
				loading={isUserLoggingIn}
				icon="content-save-outline"
				onPress={() => {
					storeApiToken(apiToken)
						.then(() => {
							dispatch(loginUser({serverUrl})).catch(FileLogger.error);
						})
						.catch(FileLogger.error);
				}}>
				{t('save')}
			</Button>
			<View style={styles.spacer} />
			{isUserLoggedIn && (
				<Button
					style={[styles.actionButton, dynamicStyles.logoutButton]}
					mode="contained"
					loading={isUserLoggingOut}
					icon="logout"
					onPress={() => {
						removeApiToken()
							.then(() => {
								setServerUrl('');
								setApiToken('');

								dispatch(logoutUser()).catch(FileLogger.error);
							})
							.catch(FileLogger.error);
					}}>
					{t('logout')}
				</Button>
			)}
		</BaseScreen>
	);
};
