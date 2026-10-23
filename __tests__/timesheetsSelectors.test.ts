import {RootState} from 'src/features/data/context/store';
import {selectTimesheetListForDate} from 'src/features/timesheets/context/timesheetsSelectors';

describe('selectTimesheetListForDate', () => {
	it('returns only timesheets beginning on the selected calendar day', () => {
		const state = {
			timesheets: {
				timesheets: {
					selected: {id: 'selected', begin: '2026-10-23T08:00:00'},
					later: {id: 'later', begin: '2026-10-23T13:00:00'},
					neighbor: {id: 'neighbor', begin: '2026-10-24T08:00:00'},
					missingBegin: {id: 'missingBegin'},
				},
			},
		} as unknown as RootState;

		const result = selectTimesheetListForDate(state, '2026-10-23');

		expect(result.map((timesheet) => timesheet.id)).toEqual([
			'later',
			'selected',
		]);
	});
});
