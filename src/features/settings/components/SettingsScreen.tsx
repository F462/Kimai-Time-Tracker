import {List, Switch, useTheme} from 'react-native-paper';
import React, {useCallback} from 'react';
import {Picker} from '@react-native-picker/picker';
import {StyleSheet} from 'react-native';
import {simplePrompt} from '@sbaiahmed1/react-native-biometrics';
import {useTranslation} from 'react-i18next';

import {
	appThemeSet,
	biometricsToUnlockEnabledStateSet,
} from '../context/settingsSlice';
import {
	selectAppTheme,
	selectIsBiometricsToUnlockEnabled,
} from '../context/settingsSelectors';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {AppTheme} from '../types';
import {BaseScreen} from 'src/ui/BaseScreen';
import {useStyle} from 'src/features/theming/utils/useStyle';

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

export const SettingsScreen = () => {
	return (
		<BaseScreen>
			<DisplaySection />
			<SecuritySection />
		</BaseScreen>
	);
};
