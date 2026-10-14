import {configureStore} from '@reduxjs/toolkit';

import {
	migrateLegacyWorkingHours,
	settingsReducer,
	workContractHoursPerDaySet,
} from 'src/features/settings/context/settingsSlice';

const configureTestStore = () =>
	configureStore({reducer: {settings: settingsReducer}});

describe('migrateLegacyWorkingHours', () => {
	it('applies legacy hours to weekdays and leaves weekends off', () => {
		expect(migrateLegacyWorkingHours(7)).toEqual({
			monday: 7,
			tuesday: 7,
			wednesday: 7,
			thursday: 7,
			friday: 7,
			saturday: 0,
			sunday: 0,
		});
	});
});

describe('workContractHoursPerDaySet', () => {
	it('marks hours as pending only when they differ from the synchronized value', () => {
		const store = configureTestStore();

		// Re-applying the unchanged value (e.g. when an input loses focus)
		// must not enable synchronization.
		store.dispatch(workContractHoursPerDaySet({day: 'monday', hours: 8}));
		expect(store.getState().settings.workContractHoursSyncPending).toBe(false);

		// A real change enables synchronization.
		store.dispatch(workContractHoursPerDaySet({day: 'monday', hours: 4}));
		expect(store.getState().settings.workContractHoursSyncPending).toBe(true);

		// Reverting back to the original value disables it again.
		store.dispatch(workContractHoursPerDaySet({day: 'monday', hours: 8}));
		expect(store.getState().settings.workContractHoursSyncPending).toBe(false);
	});

	it('keeps hours pending while any other day still differs', () => {
		const store = configureTestStore();

		store.dispatch(workContractHoursPerDaySet({day: 'monday', hours: 4}));
		store.dispatch(workContractHoursPerDaySet({day: 'tuesday', hours: 6}));
		expect(store.getState().settings.workContractHoursSyncPending).toBe(true);

		// Reverting monday back to its original value must not disable
		// synchronization while tuesday still differs.
		store.dispatch(workContractHoursPerDaySet({day: 'monday', hours: 8}));
		expect(store.getState().settings.workContractHoursSyncPending).toBe(true);

		// Only once tuesday is reverted too does it disable.
		store.dispatch(workContractHoursPerDaySet({day: 'tuesday', hours: 8}));
		expect(store.getState().settings.workContractHoursSyncPending).toBe(false);
	});
});
