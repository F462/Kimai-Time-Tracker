import React, {useCallback, useEffect, useState} from 'react';

import {Button, Text} from 'react-native-paper';
import {ScrollView, StyleSheet, View} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import loadLocalResource from 'react-native-local-resource';
import path from 'path';
import {useTranslation} from 'react-i18next';

import {
	selectIsUserLoggedIn,
	selectServerUrl
} from 'src/features/account/context/accountSelectors';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {BaseScreen} from 'src/ui/BaseScreen';
import {exportLogs} from 'src/features/logging/middleware/loggingThunks';

import AppIcon from 'src/assets/icon.svg';
import licenseFile from 'src/assets/license.txt';

const styles = StyleSheet.create({
	mainContainer: {
		alignItems: 'center'
	},
	paragraph: {
		margin: 20
	},
	appInfoTextBox: {
		alignItems: 'flex-end'
	},
	licenseContainer: {
		alignItems: 'center'
	}
});

const ServerVersionDisplay = () => {
	const {t} = useTranslation();

	const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);
	const serverUrl = useAppSelector(selectServerUrl);
	const [serverVersion, setServerVersion] = useState<string>();

	useEffect(() => {
		if (!isUserLoggedIn || serverUrl === undefined) {
			setServerVersion(undefined);
		} else {
			axios
				.get(path.join(serverUrl, 'api/version'))
				.then((response) => {
					setServerVersion(response.data.version);
				})
				.catch(console.warn);
		}
	}, [isUserLoggedIn, serverUrl]);

	return (
		serverVersion && <Text>{t('serverVersion', {version: serverVersion})}</Text>
	);
};

const LicenseText = () => {
	const [licenseText, setLicenseText] = useState<string>();
	loadLocalResource(licenseFile).then((licenseFileContent: string) => {
		setLicenseText(licenseFileContent);
	});

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
