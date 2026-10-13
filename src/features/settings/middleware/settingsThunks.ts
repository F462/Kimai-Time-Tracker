import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {
	selectIsWorkContractHoursSyncPending,
	selectWorkContractHoursPerDay,
} from '../context/settingsSelectors';
import {
	workContractHoursPerDaySynchronized,
	workContractHoursSyncCompleted,
	workContractHoursSyncFinished,
	workContractHoursSyncStarted,
} from '../context/settingsSlice';
import {WORK_DAYS} from '../types';

const WORK_CONTRACT_HOURS_PREFERENCE_PREFIX = 'work_';

let workContractSyncQueue: Promise<void> = Promise.resolve();

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
		const synchronize = async () => {
			if (
				direction === 'pull' &&
				selectIsWorkContractHoursSyncPending(getState())
			) {
				return;
			}

			dispatch(workContractHoursSyncStarted());
			try {
				const user = await api.get<CurrentUser>('api/users/me');
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

				const workContractHoursPerDay =
					selectWorkContractHoursPerDay(getState());
				await api.patch(`api/users/${user.id}/preferences`, [
					...workPreferences.map(({day, preference}) => ({
						name: preference.name,
						value: String(workContractHoursPerDay[day] * 60 * 60),
					})),
				]);
				dispatch(workContractHoursSyncCompleted(workContractHoursPerDay));
			} catch (error) {
				console.error('Unable to synchronize work-contract hours:', error);
			} finally {
				dispatch(workContractHoursSyncFinished());
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
