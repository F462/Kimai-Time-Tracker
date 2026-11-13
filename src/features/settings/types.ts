export enum AppTheme {
	SYSTEM = 'system',
	LIGHT = 'light',
	DARK = 'dark',
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

export type AutomaticBackupIntervalDays = 0 | 1 | 7 | 14 | 30;

export type SettingsState = {
	appTheme: AppTheme;
	isDarkOledEnabled: boolean;
	isBiometricsToUnlockEnabled: boolean;
	isActiveTimesheetNotificationEnabled: boolean;
	automaticBackupIntervalDays: AutomaticBackupIntervalDays;
	lastAutomaticBackupAt: number | null;
	workContractHoursPerDay: WorkContractHours;
	workContractHoursLastSynchronized: WorkContractHours;
	workContractHoursSyncPending: boolean;
	workContractHoursSyncWaiting: boolean;
	workContractHoursSyncInProgress: boolean;
};
