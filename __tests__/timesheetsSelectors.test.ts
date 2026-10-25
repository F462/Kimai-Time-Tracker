import {RootState} from 'src/features/data/context/store';
import {
	filterTimesheetList,
	selectTimesheetListForDate,
} from 'src/features/timesheets/context/timesheetsSelectors';

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

describe('filterTimesheetList', () => {
	const timesheets = [
		{id: 'one', project: 1, activity: 10},
		{id: 'two', project: 1, activity: 20},
		{id: 'three', project: 2, activity: 10},
	];

	it('combines project and activity filters and leaves unset filters open', () => {
		expect(filterTimesheetList(timesheets, 1, 10).map(({id}) => id)).toEqual([
			'one',
		]);
		expect(
			filterTimesheetList(timesheets, 2, undefined).map(({id}) => id),
		).toEqual(['three']);
		expect(filterTimesheetList(timesheets, undefined, undefined)).toEqual(
			timesheets,
		);
	});
});
