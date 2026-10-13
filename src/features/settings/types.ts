export enum AppTheme {
	SYSTEM = 'system',
	LIGHT = 'light',
	DARK = 'dark',
	DARK_OLED = 'dark_oled',
}

export const WORK_DAYS = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
] as const;

export type WorkDay = (typeof WORK_DAYS)[number];
export type WorkContractHours = Record<WorkDay, number>;

export type SettingsState = {
	appTheme: AppTheme;
	isBiometricsToUnlockEnabled: boolean;
	workContractHoursPerDay: WorkContractHours;
	workContractHoursSyncPending: boolean;
	workContractHoursSyncInProgress: boolean;
};
