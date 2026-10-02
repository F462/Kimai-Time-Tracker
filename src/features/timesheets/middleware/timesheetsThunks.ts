import dayjs from 'dayjs';
import {v4 as uuidv4} from 'uuid';

import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {
	selectKnownRemoteTimesheetIds,
	selectOnlyLocalTimesheets,
} from '../context/timesheetsSelectors';
import {timesheetsUpdated} from '../context/timesheetsSlice';
import {Timesheet, TimesheetFromApi} from '../types';

/**
 * The Kimai API paginates its list responses and caps the page size at 500
 * entries, so a single request can return at most 500 timesheets.
 */
export const TIMESHEET_PAGE_SIZE = 500;

/**
 * Builds the query string for one page of timesheets started within the given
 * range. Ordering by start time keeps the pagination stable across requests.
 */
export const buildTimesheetPageQuery = (
	begin: dayjs.Dayjs,
	end: dayjs.Dayjs,
	page: number,
): string =>
	new URLSearchParams({
		begin: begin.format('YYYY-MM-DDTHH:mm:ss'),
		end: end.format('YYYY-MM-DDTHH:mm:ss'),
		orderBy: 'begin',
		order: 'ASC',
		size: String(TIMESHEET_PAGE_SIZE),
		page: String(page),
	}).toString();

/**
 * Fetches all timesheets of the current year from the server.
 *
 * The API only returns a single page of at most 500 entries per request, so
 * this follows the pagination until every timesheet of the year has been
 * loaded. The results are mapped to local ids (keeping already known mappings
 * and unsynced local timesheets) and written to the store.
 */
export const fetchTimesheets = createAppAsyncThunk(
	'timesheets/fetchTimesheets',
	async (_, {dispatch, getState}) => {
		try {
			const begin = dayjs().startOf('year');
			const end = dayjs().endOf('year');

			const knownRemoteTimesheetIds = selectKnownRemoteTimesheetIds(getState());

			const onlyLocalTimesheets = selectOnlyLocalTimesheets(getState());

			const newTimesheetsIdTable: {[id: string]: number} = {};

			const allTimesheets: {[id: string]: Timesheet} = {
				...onlyLocalTimesheets,
			};

			let page = 1;
			for (;;) {
				let response: Array<TimesheetFromApi>;
				try {
					response = await api.get<Array<TimesheetFromApi>>(
						`api/timesheets?${buildTimesheetPageQuery(begin, end, page)}`,
					);
				} catch (error: any) {
					// A 404 means the requested page does not exist, i.e. the
					// last available page has already been fetched.
					if (error?.status === 404) {
						break;
					}
					throw error;
				}

				for (const element of response) {
					const idInKnownRemoteTimesheetTable =
						knownRemoteTimesheetIds[element.id];

					const id = (() => {
						if (idInKnownRemoteTimesheetTable) {
							return idInKnownRemoteTimesheetTable;
						}

						const newId = uuidv4();

						newTimesheetsIdTable[newId] = element.id;

						return newId;
					})();

					allTimesheets[id] = {...element, id};
				}

				// A short page is the last page, so we have all the data.
				if (response.length < TIMESHEET_PAGE_SIZE) {
					break;
				}

				page += 1;
			}

			dispatch(
				timesheetsUpdated({timesheets: allTimesheets, newTimesheetsIdTable}),
			);
		} catch (error: any) {
			console.warn(`Got error on fetch request: ${error.toString()}`);
		}
	},
);
