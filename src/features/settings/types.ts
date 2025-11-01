export enum AppTheme {
	SYSTEM = 'system',
	LIGHT = 'light',
	DARK = 'dark',
	DARK_OLED = 'dark_oled',
}

export type SettingsState = {
	appTheme: AppTheme;
};
