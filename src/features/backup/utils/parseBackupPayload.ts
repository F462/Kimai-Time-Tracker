import type {BackupData, BackupPayload} from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeEntityMap = (value: unknown): Record<string, unknown> => {
	if (Array.isArray(value)) {
		return Object.fromEntries(
			value.flatMap((item, index) => {
				if (!isRecord(item)) {
					return [];
				}
				const key =
					typeof item.id === 'string' || typeof item.id === 'number'
						? String(item.id)
						: String(index);
				return [[key, item]];
			}),
		);
	}
	if (!isRecord(value)) {
		return {};
	}
	return Object.fromEntries(
		Object.entries(value).filter(([, item]) => isRecord(item)),
	);
};

const normalizeStringMap = (value: unknown): Record<string, string> =>
	isRecord(value)
		? Object.fromEntries(
				Object.entries(value).filter(
					(entry): entry is [string, string] => typeof entry[1] === 'string',
				),
			)
		: {};

const normalizeNumberMap = (value: unknown): Record<string, number> => {
	if (!isRecord(value)) {
		return {};
	}
	return Object.fromEntries(
		Object.entries(value).flatMap(([key, item]) => {
			const number = typeof item === 'number' ? item : Number(item);
			return Number.isFinite(number) ? [[key, number]] : [];
		}),
	);
};

const WORK_DAYS = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
] as const;

const DEFAULT_WORK_HOURS = {
	monday: 8,
	tuesday: 8,
	wednesday: 8,
	thursday: 8,
	friday: 8,
	saturday: 0,
	sunday: 0,
};

const normalizeWorkHours = (
	value: unknown,
	fallback: Record<string, number>,
) => {
	const source = isRecord(value) ? value : {};
	const legacyHours =
		typeof source.standardWorkingHoursPerDay === 'number'
			? source.standardWorkingHoursPerDay
			: undefined;

	return Object.fromEntries(
		WORK_DAYS.map((day) => {
			if (typeof source[day] === 'number') {
				return [day, source[day]];
			}
			if (legacyHours !== undefined && day !== 'saturday' && day !== 'sunday') {
				return [day, legacyHours];
			}
			return [day, fallback[day] ?? DEFAULT_WORK_HOURS[day]];
		}),
	);
};

const normalizeSettings = (value: unknown): unknown => {
	if (!isRecord(value)) {
		return value;
	}

	const workContractHoursPerDay = normalizeWorkHours(
		value.workContractHoursPerDay ?? value,
		DEFAULT_WORK_HOURS,
	);

	// Older backups stored the OLED preference as a distinct theme value.
	const isLegacyDarkOled = value.appTheme === 'dark_oled';
	const validThemes = ['system', 'light', 'dark'];
	let normalizedTheme: string;
	if (isLegacyDarkOled) {
		normalizedTheme = 'dark';
	} else if (validThemes.includes(value.appTheme as string)) {
		normalizedTheme = value.appTheme as string;
	} else {
		normalizedTheme = 'system';
	}

	return {
		...value,
		appTheme: normalizedTheme,
		isDarkOledEnabled:
			typeof value.isDarkOledEnabled === 'boolean'
				? value.isDarkOledEnabled
				: isLegacyDarkOled,
		isBiometricsToUnlockEnabled:
			typeof value.isBiometricsToUnlockEnabled === 'boolean'
				? value.isBiometricsToUnlockEnabled
				: false,
		automaticBackupIntervalDays: [0, 1, 7, 14, 30].includes(
			value.automaticBackupIntervalDays as number,
		)
			? value.automaticBackupIntervalDays
			: 0,
		lastAutomaticBackupAt:
			typeof value.lastAutomaticBackupAt === 'number'
				? value.lastAutomaticBackupAt
				: null,
		workContractHoursPerDay,
		workContractHoursLastSynchronized: normalizeWorkHours(
			value.workContractHoursLastSynchronized,
			workContractHoursPerDay,
		),
		workContractHoursSyncPending:
			typeof value.workContractHoursSyncPending === 'boolean'
				? value.workContractHoursSyncPending
				: false,
		workContractHoursSyncWaiting:
			typeof value.workContractHoursSyncWaiting === 'boolean'
				? value.workContractHoursSyncWaiting
				: false,
		workContractHoursSyncInProgress:
			typeof value.workContractHoursSyncInProgress === 'boolean'
				? value.workContractHoursSyncInProgress
				: false,
	};
};

const normalizeNfc = (value: unknown): Record<string, unknown> => {
	const source = isRecord(value) ? value : {};
	return {
		tags: normalizeEntityMap(source.tags),
		isScanning: false,
	};
};

const normalizeMapSlice = (
	value: unknown,
	mapKey: string,
): Record<string, unknown> | undefined => {
	if (value === undefined) {
		return {[mapKey]: {}};
	}
	if (Array.isArray(value)) {
		return {[mapKey]: normalizeEntityMap(value)};
	}
	if (!isRecord(value)) {
		return undefined;
	}

	return {...value, [mapKey]: normalizeEntityMap(value[mapKey])};
};

const normalizeBackupData = (value: unknown): BackupData | undefined => {
	if (!isRecord(value)) {
		return undefined;
	}
	const knownSlices = [
		'account',
		'activeTimesheet',
		'activities',
		'customers',
		'nfc',
		'onboarding',
		'projects',
		'settings',
		'synchronization',
		'timesheets',
	];
	if (!knownSlices.some((slice) => Object.hasOwn(value, slice))) {
		return undefined;
	}

	const account = value.account ?? {};
	const activeTimesheet = value.activeTimesheet ?? {};
	const onboarding = value.onboarding ?? {};
	const activities = normalizeMapSlice(value.activities, 'activities');
	const customers = normalizeMapSlice(value.customers, 'customers');
	const projects = normalizeMapSlice(value.projects, 'projects');
	const timesheets = normalizeMapSlice(value.timesheets, 'timesheets');
	const settings = normalizeSettings(value.settings ?? {});
	const synchronizationValue = value.synchronization ?? {};

	if (
		!isRecord(account) ||
		!isRecord(activeTimesheet) ||
		!isRecord(onboarding) ||
		!activities ||
		!customers ||
		!projects ||
		!timesheets ||
		!isRecord(settings) ||
		!isRecord(synchronizationValue)
	) {
		return undefined;
	}
	const normalizedAccount = {
		...account,
		serverUrl:
			typeof account.serverUrl === 'string' ? account.serverUrl : undefined,
	};
	const normalizedActiveTimesheet = {
		...activeTimesheet,
		activeTimesheetId:
			typeof activeTimesheet.activeTimesheetId === 'string'
				? activeTimesheet.activeTimesheetId
				: undefined,
	};

	const validSyncStates: Record<string, number> = {
		NOT_STARTED: 0,
		RUNNING: 1,
		DONE: 2,
		FAILED: 3,
	};
	const synchronizationTimesheets = isRecord(synchronizationValue.timesheets)
		? Object.fromEntries(
				Object.entries(synchronizationValue.timesheets).map(
					([id, syncValue]) => {
						const syncState =
							typeof syncValue === 'string' && syncValue in validSyncStates
								? validSyncStates[syncValue]
								: Number(syncValue);
						return [
							id,
							Number.isInteger(syncState) && syncState >= 0 && syncState <= 3
								? syncState
								: 0,
						];
					},
				),
			)
		: {};
	const synchronizationErrors = normalizeStringMap(synchronizationValue.errors);
	const timesheetIdTable = normalizeNumberMap(timesheets.timesheetIdTable);

	if (
		typeof settings.isBiometricsToUnlockEnabled !== 'boolean' ||
		(settings.lastAutomaticBackupAt !== null &&
			typeof settings.lastAutomaticBackupAt !== 'number') ||
		typeof settings.workContractHoursSyncPending !== 'boolean' ||
		typeof settings.workContractHoursSyncWaiting !== 'boolean' ||
		typeof settings.workContractHoursSyncInProgress !== 'boolean'
	) {
		return undefined;
	}

	return {
		account: normalizedAccount,
		activeTimesheet: normalizedActiveTimesheet,
		activities: activities as BackupData['activities'],
		customers: customers as BackupData['customers'],
		nfc: normalizeNfc(value.nfc) as BackupData['nfc'],
		onboarding,
		projects: projects as BackupData['projects'],
		settings: settings as BackupData['settings'],
		synchronization: {
			...synchronizationValue,
			timesheets: synchronizationTimesheets,
			errors: synchronizationErrors,
		} as BackupData['synchronization'],
		timesheets: {
			...timesheets,
			timesheets: normalizeEntityMap(timesheets.timesheets),
			timesheetIdTable,
		} as BackupData['timesheets'],
	};
};

export const parseBackupPayload = (contents: string): BackupPayload => {
	let payload: unknown;
	try {
		payload = JSON.parse(contents);
	} catch {
		throw new Error('The selected file is not valid JSON');
	}

	if (!isRecord(payload) || !isRecord(payload.data)) {
		throw new Error('The selected file is not a supported Kimai backup');
	}

	const data = normalizeBackupData(payload.data);
	if (!data) {
		throw new Error('The selected file is not a supported Kimai backup');
	}

	return {
		app: isRecord(payload.app)
			? {
					name:
						typeof payload.app.name === 'string'
							? payload.app.name
							: 'Kimai Time Tracker',
					version:
						typeof payload.app.version === 'string'
							? payload.app.version
							: 'unknown',
					build:
						typeof payload.app.build === 'string'
							? payload.app.build
							: 'unknown',
				}
			: {name: 'Kimai Time Tracker', version: 'unknown', build: 'unknown'},
		exportedAt:
			typeof payload.exportedAt === 'string' &&
			!Number.isNaN(Date.parse(payload.exportedAt))
				? payload.exportedAt
				: new Date(0).toISOString(),
		device: isRecord(payload.device)
			? {
					model:
						typeof payload.device.model === 'string'
							? payload.device.model
							: 'unknown',
					os:
						typeof payload.device.os === 'string'
							? payload.device.os
							: 'unknown',
					osVersion:
						typeof payload.device.osVersion === 'string'
							? payload.device.osVersion
							: 'unknown',
				}
			: {model: 'unknown', os: 'unknown', osVersion: 'unknown'},
		data,
	};
};
