import {Picker} from '@react-native-picker/picker';
import {simplePrompt} from '@sbaiahmed1/react-native-biometrics';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, Linking, Platform, ScrollView, StyleSheet} from 'react-native';
import notifications, {AndroidImportance} from 'react-native-notify-kit';
import {List, Switch, useTheme} from 'react-native-paper';

import {
	chooseBackupFolder,
	exportData,
	getBackupFolder,
	getBackupFolderPath,
	importData,
} from 'src/features/backup/middleware/backupThunks';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {useAppNavigation} from 'src/features/navigation/context/hooks';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {BaseScreen} from 'src/ui/BaseScreen';
import {
	selectAppTheme,
	selectAutomaticBackupIntervalDays,
	selectIsBiometricsToUnlockEnabled,
	selectIsDarkOledEnabled,
} from '../context/settingsSelectors';
import {
	appThemeSet,
	automaticBackupIntervalDaysSet,
	biometricsToUnlockEnabledStateSet,
	darkOledEnabledSet,
} from '../context/settingsSlice';
import {AppTheme, AutomaticBackupIntervalDays} from '../types';

const styles = StyleSheet.create({
	disabled: {
		opacity: 0.38,
	},
	themePicker: {
		width: 150,
	},
});

const LightDarkIcon = () => <List.Icon icon="theme-light-dark" />;

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
			{[AppTheme.SYSTEM, AppTheme.LIGHT, AppTheme.DARK].map((themeValue) => (
				<Picker.Item
					label={t(`appThemeValues.${themeValue}`)}
					value={themeValue}
				/>
			))}
		</Picker>
	);
};

const DarkOledIcon = () => <List.Icon icon="brightness-4" />;
const DarkOledSwitch = () => {
	const dispatch = useAppDispatch();
	const isDarkOledEnabled = useAppSelector(selectIsDarkOledEnabled);
	const appThemeSetting = useAppSelector(selectAppTheme);

	return (
		<Switch
			value={isDarkOledEnabled}
			disabled={appThemeSetting === AppTheme.LIGHT}
			onValueChange={(newValue) => {
				dispatch(darkOledEnabledSet(newValue));
			}}
		/>
	);
};
const DarkOledItem = () => {
	const {t} = useTranslation();
	return (
		<List.Item
			title={t('darkOled')}
			description={t('darkOledDescription')}
			left={DarkOledIcon}
			right={DarkOledSwitch}
		/>
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
			<DarkOledItem />
		</List.Section>
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

const BackupIcon = () => <List.Icon icon="backup-restore" />;

const BackupIntervalPicker = ({disabled}: {disabled: boolean}) => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const intervalDays = useAppSelector(selectAutomaticBackupIntervalDays);

	return (
		<Picker
			style={[styles.themePicker, {color: theme.colors.onSurface}]}
			selectedValue={intervalDays}
			selectionColor={theme.colors.primary}
			dropdownIconColor={theme.colors.onSurface}
			mode="dropdown"
			enabled={!disabled}
			onValueChange={(value: AutomaticBackupIntervalDays) =>
				dispatch(automaticBackupIntervalDaysSet(value))
			}>
			<Picker.Item label={t('automaticBackupDisabled')} value={0} />
			{([1, 7, 14, 30] as const).map((days) => (
				<Picker.Item
					key={days}
					label={t('automaticBackupEveryDays', {days})}
					value={days}
				/>
			))}
		</Picker>
	);
};

const getBackupIntervalRight = (disabled: boolean) => () => (
	<BackupIntervalPicker disabled={disabled} />
);

const DataSection = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const [hasBackupFolder, setHasBackupFolder] = useState(false);
	const [backupFolderPath, setBackupFolderPath] = useState<string | null>(null);
	const [isExporting, setIsExporting] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [isChoosingFolder, setIsChoosingFolder] = useState(false);

	useEffect(() => {
		dispatch(getBackupFolder())
			.unwrap()
			.then(setHasBackupFolder)
			.catch((error) =>
				console.error('Loading the backup folder failed', error),
			);
		dispatch(getBackupFolderPath())
			.unwrap()
			.then(setBackupFolderPath)
			.catch((error) =>
				console.error('Loading the backup folder path failed', error),
			);
	}, [dispatch]);

	const onChooseBackupFolder = useCallback(() => {
		if (isChoosingFolder || isExporting || isImporting) {
			return;
		}

		setIsChoosingFolder(true);
		dispatch(chooseBackupFolder())
			.unwrap()
			.then((folderSelected) => {
				if (folderSelected) {
					setHasBackupFolder(true);
					dispatch(getBackupFolderPath())
						.unwrap()
						.then(setBackupFolderPath)
						.catch((error) =>
							console.error('Loading the backup folder path failed', error),
						);
				}
			})
			.catch((error) => {
				console.error('Selecting the backup folder failed', error);
				Alert.alert(t('warning'), t('backupDataError'));
			})
			.finally(() => setIsChoosingFolder(false));
	}, [dispatch, isChoosingFolder, isExporting, isImporting, t]);

	const onBackup = useCallback(() => {
		if (isExporting || isImporting) {
			return;
		}

		setIsExporting(true);
		dispatch(exportData())
			.catch((error) => {
				console.error('Exporting the backup failed', error);
				Alert.alert(t('warning'), t('backupDataError'));
			})
			.finally(() => setIsExporting(false));
	}, [dispatch, isExporting, isImporting, t]);

	const onRestore = useCallback(() => {
		if (isImporting || isExporting || isChoosingFolder) {
			return;
		}

		Alert.alert(t('restoreDataConfirmTitle'), t('restoreDataConfirmMessage'), [
			{text: t('cancel'), style: 'cancel'},
			{
				text: t('restoreData'),
				style: 'destructive',
				onPress: () => {
					setIsImporting(true);
					dispatch(importData())
						.unwrap()
						.then((restored) => {
							if (restored) {
								Alert.alert(t('restoreData'), t('restoreDataSuccess'));
							}
						})
						.catch((error) => {
							console.error('Restoring the backup failed', error);
							Alert.alert(t('warning'), t('restoreDataError'));
						})
						.finally(() => setIsImporting(false));
				},
			},
		]);
	}, [dispatch, isChoosingFolder, isExporting, isImporting, t]);
	const backupActionsDisabled =
		!hasBackupFolder || isExporting || isImporting || isChoosingFolder;

	return (
		<List.Section>
			<List.Subheader>{t('dataTitle')}</List.Subheader>
			<List.Item
				title={t('backupFolder')}
				description={
					backupFolderPath ??
					t(
						hasBackupFolder
							? 'backupFolderSelected'
							: 'backupFolderDescription',
					)
				}
				left={BackupIcon}
				onPress={onChooseBackupFolder}
				disabled={isChoosingFolder || isExporting}
			/>
			<List.Item
				title={t('automaticBackup')}
				description={t('automaticBackupDescription')}
				left={BackupIcon}
				right={getBackupIntervalRight(backupActionsDisabled)}
				style={backupActionsDisabled && styles.disabled}
				disabled={backupActionsDisabled}
			/>
			<List.Item
				title={t('backupData')}
				description={t('backupDataDescription')}
				left={BackupIcon}
				onPress={onBackup}
				style={backupActionsDisabled && styles.disabled}
				disabled={backupActionsDisabled}
			/>
			<List.Item
				title={t('restoreData')}
				description={t('restoreDataDescription')}
				left={BackupIcon}
				onPress={onRestore}
				disabled={isExporting || isImporting || isChoosingFolder}
			/>
		</List.Section>
	);
};

const DAILY_WORKING_HOURS_CHANNEL_ID = 'daily-working-hours';
const NotificationBellIcon = () => <List.Icon icon="bell-outline" />;
const SettingsChevronIcon = () => <List.Icon icon="chevron-right" />;
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
			<ScrollView keyboardShouldPersistTaps="handled">
				<DisplaySection />
				<WorkingTimeSection />
				<NotificationSettingsItem />
				<SecuritySection />
				<DataSection />
			</ScrollView>
		</BaseScreen>
	);
};
