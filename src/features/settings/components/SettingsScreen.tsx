import {Picker} from '@react-native-picker/picker';
import {simplePrompt} from '@sbaiahmed1/react-native-biometrics';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {List, Switch, useTheme} from 'react-native-paper';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {BaseScreen} from 'src/ui/BaseScreen';
import {
	selectAppTheme,
	selectIsBiometricsToUnlockEnabled,
	selectStandardWorkingHoursPerDay,
} from '../context/settingsSelectors';
import {
	appThemeSet,
	biometricsToUnlockEnabledStateSet,
	standardWorkingHoursPerDaySet,
} from '../context/settingsSlice';
import {AppTheme} from '../types';

const styles = StyleSheet.create({
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

const WORKING_HOURS_OPTIONS = [4, 6, 8, 10, 12];

const ClockIcon = () => <List.Icon icon="clock" />;

const WorkingHoursSelection = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const theme = useTheme();

	const standardWorkingHoursPerDay = useAppSelector(
		selectStandardWorkingHoursPerDay,
	);

	const dynamicStyles = useStyle(
		() => ({
			workingHoursPicker: {
				color: theme.colors.onSurface,
			},
		}),
		[theme.colors.onSurface],
	);

	return (
		<Picker
			style={[styles.themePicker, dynamicStyles.workingHoursPicker]}
			selectedValue={standardWorkingHoursPerDay}
			selectionColor={theme.colors.primary}
			dropdownIconColor={dynamicStyles.workingHoursPicker.color}
			mode="dropdown"
			onValueChange={(itemValue: number) =>
				dispatch(standardWorkingHoursPerDaySet(itemValue))
			}>
			{WORKING_HOURS_OPTIONS.map((hours) => (
				<Picker.Item
					key={hours}
					label={t('workingHoursOption', {hours})}
					value={hours}
				/>
			))}
		</Picker>
	);
};

const WorkingTimeSection = () => {
	const {t} = useTranslation();
	return (
		<List.Section>
			<List.Subheader>{t('workingTimeTitle')}</List.Subheader>
			<List.Item
				title={t('standardWorkingHoursPerDay')}
				left={ClockIcon}
				right={WorkingHoursSelection}
			/>
		</List.Section>
	);
};

export const SettingsScreen = () => {
	return (
		<BaseScreen>
			<DisplaySection />
			<WorkingTimeSection />
			<SecuritySection />
		</BaseScreen>
	);
};
