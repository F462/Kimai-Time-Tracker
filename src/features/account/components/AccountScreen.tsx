import path from 'path';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Linking, StyleSheet, View} from 'react-native';
import {Button, Portal, Text, TextInput, useTheme} from 'react-native-paper';

import {
	selectIsUserLoggingIn,
	selectIsUserLoggingOut,
} from 'src/features/appState/context/appStateSelectors';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {BaseScreen} from 'src/ui/BaseScreen';
import {selectIsUserLoggedIn} from '../context/accountSelectors';
import {loginUser, logoutUser} from '../middleware/accountThunks';
import {removeApiToken, storeApiToken} from '../utils/accountPersistor';
import {api} from '../utils/ApiClient';
import type {QrCredentials} from '../utils/parseQrCredentials';
import {QrScanner} from './QrScanner';

const styles = StyleSheet.create({
	inputContainer: {
		marginVertical: 10,
	},
	actionButton: {
		marginHorizontal: 10,
		marginVertical: 20,
	},
	spacer: {
		flex: 1,
	},
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
	const [serverUrl, setServerUrl] = useState(api.getBaseUrl() ?? '');
	const [isScannerVisible, setIsScannerVisible] = useState(false);
	const [isDirty, setIsDirty] = useState(true);

	const canApiTokenBeCreated = !!serverUrl;

	const onCreateApiToken = useCallback(() => {
		Linking.openURL(
			path.join(serverUrl, languageTag, 'profile/admin/api-token'),
		).catch(console.error);
	}, [languageTag, serverUrl]);

	const handleCredentialsScanned = useCallback(
		(credentials: QrCredentials) => {
			setIsScannerVisible(false);
			setServerUrl(credentials.serverUrl);
			setApiToken(credentials.apiToken);
			storeApiToken(credentials.apiToken)
				.then(() => {
					setIsDirty(false);
					dispatch(loginUser({serverUrl: credentials.serverUrl})).catch(
						console.error,
					);
				})
				.catch(console.error);
		},
		[dispatch],
	);

	const dynamicStyles = useStyle(
		() => ({
			logoutButton: {
				backgroundColor: theme.colors.error,
			},
		}),
		[theme.colors.error],
	);

	return (
		<BaseScreen>
			<Button
				style={styles.actionButton}
				mode="outlined"
				// eslint-disable-next-line @cspell/spellchecker
				icon="qrcode-scan"
				onPress={() => setIsScannerVisible(true)}>
				{t('scanQrCode')}
			</Button>
			<View style={styles.inputContainer}>
				<Text>{t('enterServerUrl')}</Text>
				<TextInput
					value={serverUrl}
					onChangeText={(text) => {
						setServerUrl(text);
						setIsDirty(true);
					}}
				/>
			</View>
			{canApiTokenBeCreated && (
				<Button onPress={onCreateApiToken}>{t('createApiToken')}</Button>
			)}
			<View style={styles.inputContainer}>
				<Text>{t('enterApiToken')}</Text>
				<TextInput
					value={apiToken}
					onChangeText={(text) => {
						setApiToken(text);
						setIsDirty(true);
					}}
					secureTextEntry
				/>
			</View>
			<Button
				style={styles.actionButton}
				mode="contained"
				loading={isUserLoggingIn}
				disabled={!isDirty}
				icon="content-save-outline"
				onPress={() => {
					storeApiToken(apiToken)
						.then(() => {
							setIsDirty(false);
							dispatch(loginUser({serverUrl})).catch(console.error);
						})
						.catch(console.error);
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
								setIsDirty(true);

								dispatch(logoutUser()).catch(console.error);
							})
							.catch(console.error);
					}}>
					{t('logout')}
				</Button>
			)}
			{isScannerVisible && (
				<Portal>
					<QrScanner
						onCredentialsScanned={handleCredentialsScanned}
						onClose={() => setIsScannerVisible(false)}
					/>
				</Portal>
			)}
		</BaseScreen>
	);
};
