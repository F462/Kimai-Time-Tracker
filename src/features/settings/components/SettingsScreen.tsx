import {Picker} from '@react-native-picker/picker';
import {simplePrompt} from '@sbaiahmed1/react-native-biometrics';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Linking, Platform, StyleSheet} from 'react-native';
import notifications, {AndroidImportance} from 'react-native-notify-kit';
import {List, Switch, useTheme} from 'react-native-paper';

import fileStorage from 'src/features/data/context/fileStorage';
import {
	pickSharedFolder,
	releaseSharedFolder,
} from 'src/features/data/context/sharedFolderStorage';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {useAppNavigation} from 'src/features/navigation/context/hooks';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {BaseScreen} from 'src/ui/BaseScreen';
import {
	selectAppTheme,
	selectIsBiometricsToUnlockEnabled,
} from '../context/settingsSelectors';
import {
	appThemeSet,
	biometricsToUnlockEnabledStateSet,
} from '../context/settingsSlice';
import {AppTheme} from '../types';

const styles = StyleSheet.create({
	themePicker: {
		width: 150,
	},
});

const LightDarkIcon = () => <List.Icon icon="theme-light-dark" />;
const LocalStorageFolderIcon = () => <List.Icon icon="folder-outline" />;
const SettingsChevronIcon = () => <List.Icon icon="chevron-right" />;

const ThemeSelection = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const theme = useTheme();

	const appThemeSetting = useAppSelector(selectAppTheme);

	const dynamicStyles = useStyle(
		() => ({
			themePicker: {
				color: theme.colors.onSurface,
			},
		}),
		[theme.colors.onSurface],
	);

	return (
		<Picker
			style={[styles.themePicker, dynamicStyles.themePicker]}
			selectedValue={appThemeSetting}
			selectionColor={theme.colors.primary}
			dropdownIconColor={dynamicStyles.themePicker.color}
			mode="dropdown"
			onValueChange={(itemValue: AppTheme) => dispatch(appThemeSet(itemValue))}>
			{Object.values(AppTheme).map((themeValue) => (
				<Picker.Item
					label={t(`appThemeValues.${themeValue}`)}
					value={themeValue}
				/>
			))}
		</Picker>
	);
};

const DisplaySection = () => {
	const {t} = useTranslation();
	return (
		<List.Section>
			<List.Subheader>{t('displayTitle')}</List.Subheader>
			<List.Item
				title={t('appTheme')}
				left={LightDarkIcon}
				right={ThemeSelection}
			/>
		</List.Section>
	);
};

const LocalStorageLocation = () => {
	const {t} = useTranslation();
	const [directory, setDirectory] = useState('');
	const [error, setError] = useState('');
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		fileStorage
			.getDirectory()
			.then(setDirectory)
			.catch((storageError) =>
				console.warn('Unable to read storage path:', storageError),
			);
	}, []);

	const chooseDirectory = async () => {
		let selectedFolder:
			Awaited<ReturnType<typeof pickSharedFolder>> | undefined;
		setSaving(true);
		setError('');
		try {
			selectedFolder = await pickSharedFolder();
			await fileStorage.setExternalDirectory(
				selectedFolder.uri,
				selectedFolder.name,
			);
			setDirectory(await fileStorage.getDirectory());
		} catch (storageError) {
			console.warn('Shared folder selection failed:', storageError);
			if (selectedFolder) {
				releaseSharedFolder(selectedFolder.uri).catch(console.warn);
			}
			const errorCode = (storageError as {code?: string})?.code;
			if (
				errorCode !== 'E_CANCELLED' &&
				!(
					storageError instanceof Error &&
					storageError.message === 'E_CANCELLED'
				)
			) {
				let message = t('storageFolderSaveError');
				if (errorCode === 'E_PERSIST_PERMISSION_UNSUPPORTED') {
					message = t('storageFolderPersistentPermissionUnsupported');
				} else if (errorCode === 'E_WRITE_PERMISSION_MISSING') {
					message = t('storageFolderWritePermissionMissing');
				}
				setError(message);
			}
		} finally {
			setSaving(false);
		}
	};

	const switchToPrivateStorage = async () => {
		setSaving(true);
		setError('');
		try {
			await fileStorage.setExternalDirectory(null);
			setDirectory(await fileStorage.getDirectory());
		} catch (storageError) {
			setError(t('storageFolderSaveError'));
			console.warn('Unable to switch to app storage:', storageError);
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<List.Section>
				<List.Subheader>{t('localStorageTitle')}</List.Subheader>
				<List.Item
					title={t('chooseSharedFolder')}
					description={directory || t('defaultStoragePath')}
					left={LocalStorageFolderIcon}
					right={SettingsChevronIcon}
					onPress={() => {
						chooseDirectory().catch(console.warn);
					}}
					disabled={saving}
				/>
				<List.Item title={t('sharedFolderDescription')} />
				{directory ? (
					<List.Item
						title={t('usePrivateStorage')}
						left={SettingsChevronIcon}
						onPress={() => {
							switchToPrivateStorage().catch(console.warn);
						}}
						disabled={saving}
					/>
				) : null}
				{error ? <List.Item title={error} /> : null}
			</List.Section>
		</>
	);
};

const FingerprintIcon = () => <List.Icon icon="fingerprint" />;
const BiometricsSwitch = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();

	const isBiometricsToUnlockEnabled = useAppSelector(
		selectIsBiometricsToUnlockEnabled,
	);
	const setBiometricsEnabledState = useCallback(
		(newValue: boolean) => {
			if (newValue) {
				simplePrompt(t('pleaseAuthenticateToContinue'))
					.then((result) => {
						if (result.success) {
							dispatch(biometricsToUnlockEnabledStateSet(true));
						}
					})
					.catch((error) => console.error('Authentication error:', error));
			} else {
				dispatch(biometricsToUnlockEnabledStateSet(false));
			}
		},
		[dispatch, t],
	);

	return (
		<Switch
			value={isBiometricsToUnlockEnabled}
			onValueChange={setBiometricsEnabledState}
		/>
	);
};
const BiometricsItem = () => {
	const {t} = useTranslation();
	return (
		<List.Item
			title={t('useBiometrics')}
			left={FingerprintIcon}
			right={BiometricsSwitch}
		/>
	);
};
const SecuritySection = () => {
	const {t} = useTranslation();
	return (
		<List.Section>
			<List.Subheader>{t('securityTitle')}</List.Subheader>
			<BiometricsItem />
		</List.Section>
	);
};

const DAILY_WORKING_HOURS_CHANNEL_ID = 'daily-working-hours';
const NotificationBellIcon = () => <List.Icon icon="bell-outline" />;
const WorkContractIcon = () => <List.Icon icon="briefcase-outline" />;

const WorkingTimeSection = () => {
	const {t} = useTranslation();
	const navigation = useAppNavigation();
	return (
		<List.Section>
			<List.Subheader>{t('workingTimeTitle')}</List.Subheader>
			<List.Item
				title={t('workContract')}
				description={t('workContractDescription')}
				left={WorkContractIcon}
				right={SettingsChevronIcon}
				onPress={() => navigation.navigate('WorkContract')}
			/>
		</List.Section>
	);
};

const NotificationSettingsItem = () => {
	const {t} = useTranslation();

	const openNotificationSettings = useCallback(() => {
		const openSettings = async () => {
			try {
				if (Platform.OS === 'ios') {
					await Linking.openSettings();
					return;
				}

				await notifications.createChannel({
					id: DAILY_WORKING_HOURS_CHANNEL_ID,
					name: t('dailyWorkingHoursChannel'),
					importance: AndroidImportance.DEFAULT,
				});
				await notifications.openNotificationSettings(
					DAILY_WORKING_HOURS_CHANNEL_ID,
				);
			} catch (error) {
				console.warn('Unable to open notification settings:', error);
			}
		};

		openSettings().catch(console.warn);
	}, [t]);

	return (
		<List.Section>
			<List.Subheader>{t('notificationsTitle')}</List.Subheader>
			<List.Item
				title={t('dailyWorkingHoursNotificationSettings')}
				description={t('manageDailyWorkingHoursNotificationSettings')}
				left={NotificationBellIcon}
				right={SettingsChevronIcon}
				onPress={openNotificationSettings}
			/>
		</List.Section>
	);
};

export const SettingsScreen = () => {
	return (
		<BaseScreen>
			<DisplaySection />
			<LocalStorageLocation />
			<WorkingTimeSection />
			<NotificationSettingsItem />
			<SecuritySection />
		</BaseScreen>
	);
};
