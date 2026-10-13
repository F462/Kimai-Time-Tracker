import {migrateLegacyWorkingHours} from 'src/features/settings/context/settingsSlice';

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
