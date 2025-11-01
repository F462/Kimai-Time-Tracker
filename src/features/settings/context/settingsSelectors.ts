import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectSettingsState = (state: RootState) => state.settings;

export const selectAppTheme = createSelector(
	[selectSettingsState],
	(settings) => settings.appTheme,
);
