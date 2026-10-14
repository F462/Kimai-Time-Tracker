import {api} from 'src/features/account/utils/ApiClient';
import type {AppDispatch} from 'src/features/data/context/store';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {selectIsInternetReachable} from 'src/features/network/context/networkSelector';
import {
	selectIsWorkContractHoursSyncPending,
	selectWorkContractHoursPerDay,
} from '../context/settingsSelectors';
import {
	workContractHoursPerDaySynchronized,
	workContractHoursSyncAborted,
	workContractHoursSyncCompleted,
	workContractHoursSyncFinished,
	workContractHoursSyncReconciled,
	workContractHoursSyncStarted,
	workContractHoursSyncWaiting,
} from '../context/settingsSlice';
import {WORK_DAYS, WorkDay} from '../types';

const WORK_CONTRACT_HOURS_PREFERENCE_PREFIX = 'work_';

let workContractSyncQueue: Promise<void> = Promise.resolve();
let workContractSyncGeneration = 0;
let activeWorkContractSyncController: AbortController | undefined;

type UserPreference = {
	name: string;
	value: string | null;
};

type CurrentUser = {
	id: number;
	preferences?: UserPreference[];
};

const getWorkDay = (preferenceName: string) =>
	WORK_DAYS.find(
		(day) =>
			preferenceName === `${WORK_CONTRACT_HOURS_PREFERENCE_PREFIX}${day}`,
	);

const parseWorkHoursInSeconds = (value: string | null) => {
	if (value === null || value.trim() === '') {
		return undefined;
	}

	const seconds = Number(value);
	if (!Number.isFinite(seconds) || seconds < 0 || seconds > 24 * 60 * 60) {
		return undefined;
	}

	return seconds / 60 / 60;
};

export const synchronizeWorkContractHours = createAppAsyncThunk<
	void,
	{direction: 'pull' | 'push'}
>(
	'settings/synchronizeWorkContractHours',
	async ({direction}, {dispatch, getState}) => {
		const generation = workContractSyncGeneration;
		const synchronize = async () => {
			if (generation !== workContractSyncGeneration) {
				return;
			}
			if (
				direction === 'pull' &&
				selectIsWorkContractHoursSyncPending(getState())
			) {
				return;
			}
			if (
				direction === 'push' &&
				!selectIsWorkContractHoursSyncPending(getState())
			) {
				return;
			}
			if (
				direction === 'push' &&
				selectIsInternetReachable(getState()) === false
			) {
				dispatch(workContractHoursSyncWaiting());
				return;
			}

			const controller = new AbortController();
			activeWorkContractSyncController = controller;
			dispatch(workContractHoursSyncStarted());
			try {
				const user = await api.get<CurrentUser>('api/users/me', {
					signal: controller.signal,
				});
				if (generation !== workContractSyncGeneration) {
					return;
				}
				const workPreferences = (user.preferences ?? []).flatMap(
					(preference) => {
						const day = getWorkDay(preference.name);
						return day ? [{day, preference}] : [];
					},
				);

				if (workPreferences.length === 0) {
					return;
				}

				if (direction === 'pull') {
					if (selectIsWorkContractHoursSyncPending(getState())) {
						return;
					}

					const localHours = selectWorkContractHoursPerDay(getState());
					const remoteHours = {...localHours};
					let hasRemoteHours = false;
					for (const {day, preference} of workPreferences) {
						const hours = parseWorkHoursInSeconds(preference.value);
						if (hours !== undefined) {
							remoteHours[day] = hours;
							hasRemoteHours = true;
						}
					}

					if (hasRemoteHours) {
						dispatch(workContractHoursPerDaySynchronized(remoteHours));
						return;
					}
					return;
				}

				const localHours = selectWorkContractHoursPerDay(getState());
				const lastSynchronized =
					getState().settings.workContractHoursLastSynchronized;
				const remoteHours = {...lastSynchronized};
				const reconciledHours = {...localHours};
				const preferencesToUpdate: Array<{
					day: WorkDay;
					preference: UserPreference;
				}> = [];
				for (const {day, preference} of workPreferences) {
					const serverHours = parseWorkHoursInSeconds(preference.value);
					if (serverHours === undefined) {
						if (localHours[day] !== lastSynchronized[day]) {
							preferencesToUpdate.push({day, preference});
						}
						continue;
					}

					remoteHours[day] = serverHours;
					if (serverHours !== lastSynchronized[day]) {
						reconciledHours[day] = serverHours;
					} else if (localHours[day] !== lastSynchronized[day]) {
						preferencesToUpdate.push({day, preference});
					}
				}

				dispatch(
					workContractHoursSyncReconciled({
						hours: reconciledHours,
						lastSynchronized: remoteHours,
					}),
				);
				if (preferencesToUpdate.length > 0) {
					await api.patch(
						`api/users/${user.id}/preferences`,
						preferencesToUpdate.map(({day, preference}) => ({
							name: preference.name,
							value: String(reconciledHours[day] * 60 * 60),
						})),
						{signal: controller.signal},
					);
				}
				if (generation !== workContractSyncGeneration) {
					return;
				}
				if (preferencesToUpdate.length > 0) {
					dispatch(workContractHoursSyncCompleted(reconciledHours));
				}
			} catch (error) {
				if (generation === workContractSyncGeneration) {
					if (
						direction === 'push' &&
						selectIsInternetReachable(getState()) === false
					) {
						dispatch(workContractHoursSyncWaiting());
					}
					console.error('Unable to synchronize work-contract hours:', error);
				}
			} finally {
				if (activeWorkContractSyncController === controller) {
					activeWorkContractSyncController = undefined;
				}
				if (generation === workContractSyncGeneration) {
					dispatch(workContractHoursSyncFinished());
				}
			}
		};

		const request = workContractSyncQueue.then(synchronize, synchronize);
		workContractSyncQueue = request.then(
			() => undefined,
			() => undefined,
		);
		await request;
	},
);

export const abortWorkContractHoursSync = () => (dispatch: AppDispatch) => {
	workContractSyncGeneration += 1;
	activeWorkContractSyncController?.abort();
	activeWorkContractSyncController = undefined;
	dispatch(workContractHoursSyncAborted());
};
