import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {Button, Text} from 'react-native-paper';

import AppIcon from 'src/assets/icon.svg';
import licenseText from 'src/assets/license.txt';
import {selectIsUserLoggedIn} from 'src/features/account/context/accountSelectors';
import {api} from 'src/features/account/utils/ApiClient';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {exportLogs} from 'src/features/logging/middleware/loggingThunks';
import {BaseScreen} from 'src/ui/BaseScreen';

const styles = StyleSheet.create({
	mainContainer: {
		alignItems: 'center',
	},
	paragraph: {
		margin: 20,
	},
	appInfoTextBox: {
		alignItems: 'flex-end',
	},
	licenseContainer: {
		alignItems: 'center',
	},
});

const ServerVersionDisplay = () => {
	const {t} = useTranslation();

	const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);
	const [serverVersion, setServerVersion] = useState<string>();

	useEffect(() => {
		if (!isUserLoggedIn || api.isConfigured()) {
			setServerVersion(undefined);
		} else {
			api
				.get<{version: string}>('api/version')
				.then((response) => {
					setServerVersion(response.version);
				})
				.catch(console.warn);
		}
	}, [isUserLoggedIn]);

	return (
		serverVersion && <Text>{t('serverVersion', {version: serverVersion})}</Text>
	);
};

const LicenseText = () => {
	return <Text variant="bodySmall">{licenseText}</Text>;
};

const ExportLogsButton = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();

	const onPress = useCallback(() => {
		dispatch(exportLogs()).catch(console.error);
	}, [dispatch]);

	return <Button onPress={onPress}>{t('exportLogs')}</Button>;
};

export const AboutScreen = () => {
	const {t} = useTranslation();

	const iconSize = 200;

	return (
		<BaseScreen>
			<ScrollView>
				<View style={styles.mainContainer}>
					<View style={styles.paragraph}>
						<Text variant="headlineLarge">
							{DeviceInfo.getApplicationName()}
						</Text>
					</View>
					<AppIcon width={iconSize} height={iconSize} />
					<View style={[styles.paragraph, styles.appInfoTextBox]}>
						<Text>
							{t('appVersion', {version: DeviceInfo.getReadableVersion()})}
						</Text>
						<ServerVersionDisplay />
					</View>
					<ExportLogsButton />
					<View style={[styles.paragraph, styles.licenseContainer]}>
						<Text variant="titleMedium">{t('license')}</Text>
						<LicenseText />
					</View>
				</View>
			</ScrollView>
		</BaseScreen>
	);
};
