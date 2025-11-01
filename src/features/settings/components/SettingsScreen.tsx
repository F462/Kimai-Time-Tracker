import {List, useTheme} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';
import React from 'react';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {AppTheme} from '../types';
import {BaseScreen} from 'src/ui/BaseScreen';
import {appThemeSet} from '../context/settingsSlice';
import {selectAppTheme} from '../context/settingsSelectors';
import {useStyle} from '../../theming/utils/useStyle';

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

export const SettingsScreen = () => {
	return (
		<BaseScreen>
			<DisplaySection />
		</BaseScreen>
	);
};
