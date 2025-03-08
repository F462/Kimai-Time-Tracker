import {FileLogger} from 'react-native-file-logger';
import axios from 'axios';
import path from 'path';
import {v4 as uuidv4} from 'uuid';

import {
	selectKnownRemoteTimesheetIds,
	selectOnlyLocalTimesheets
} from '../context/timesheetsSelectors';
import {TimesheetFromApi} from '../types';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';
import {timesheetsUpdated} from '../context/timesheetsSlice';

export const fetchTimesheets = createAppAsyncThunk(
	'timesheets/fetchTimesheets',
	async (_, {dispatch, getState}) => {
		const serverUrl = selectServerUrl(getState());

		if (serverUrl === undefined) {
			throw Error('Server URL is undefined');
		}

		try {
			const response = await axios.get<Array<TimesheetFromApi>>(
				path.join(serverUrl, 'api/timesheets')
			);

			const knownRemoteTimesheetIds = selectKnownRemoteTimesheetIds(getState());

			const onlyLocalTimesheets = selectOnlyLocalTimesheets(getState());

			const allTimesheets = response.data.reduce((container, element) => {
				const id = (() => {
					const idInKnownRemoteTimesheetTable =
						knownRemoteTimesheetIds[element.id];
					if (idInKnownRemoteTimesheetTable) {
						return idInKnownRemoteTimesheetTable;
					}

					return uuidv4();
				})();

				return {...container, [id]: {...element, id}};
			}, onlyLocalTimesheets);

			dispatch(timesheetsUpdated(allTimesheets));
		} catch (error: any) {
			FileLogger.warn(`Got error on axios request: ${error.toString()}`);
		}
	}
);
