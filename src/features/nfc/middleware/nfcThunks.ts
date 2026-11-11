import uuid from 'react-native-uuid';

import {selectActiveTimesheetId} from 'src/features/activeTimesheet/context/activeTimesheetSelectors';
import {newTimesheetStarted} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {stopActiveTimesheet} from 'src/features/activeTimesheet/middleware/activeTimesheetThunks';
import {selectSelectedActivityId} from 'src/features/activities/context/activitiesSelectors';
import {AppDispatch, RootState} from 'src/features/data/context/store';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {selectSelectedProjectId} from 'src/features/projects/context/projectsSelectors';
import {selectIsNfcScanning, selectNfcTag} from '../context/nfcSelectors';
import {nfcScanningStopped, nfcTagAdded} from '../context/nfcSlice';

/**
 * Registers a newly scanned NFC tag with a default name derived from its
 * UID and exits scanning mode.
 */
export const nfcRegisterTag = createAppAsyncThunk<
	string,
	string,
	{
		state: RootState;
		dispatch: AppDispatch;
	}
>('nfc/registerTag', (tagId, {dispatch}) => {
	const name = `NFC ${tagId.slice(-4)}`;
	dispatch(nfcTagAdded({id: tagId, name}));
	dispatch(nfcScanningStopped());
	return tagId;
});

/**
 * Handles an NFC tag detection:
 * - If scanning is active, the tag is registered as a new known tag.
 * - Otherwise the scanned tag must already be a known tag: it is used to
 *   toggle the active timesheet (stopping the running one, or starting a new
 *   one). When the scanned tag has a configured project and activity, those
 *   are used; otherwise the currently selected project and activity are used
 *   (an NFC attendance recorder).
 *
 * Rejects with an i18n key when the tag is unknown or a timesheet cannot be
 * started, so the caller can surface the reason to the user.
 */
export const nfcTagDetected = createAppAsyncThunk<
	void,
	string,
	{
		state: RootState;
		dispatch: AppDispatch;
		rejectedValue: string;
	}
>('nfc/tagDetected', async (tagId, {dispatch, getState, rejectWithValue}) => {
	const state = getState();

	if (selectIsNfcScanning(state)) {
		await dispatch(nfcRegisterTag(tagId));
		return;
	}

	const tag = selectNfcTag(tagId)(state);
	if (tag === undefined) {
		return rejectWithValue('nfc.unknownTag');
	}

	const activeTimesheetId = selectActiveTimesheetId(state);

	if (activeTimesheetId !== undefined) {
		await dispatch(stopActiveTimesheet());
		return;
	}

	const project = tag.projectId ?? selectSelectedProjectId(state);
	const activity = tag.activityId ?? selectSelectedActivityId(state);

	if (project === undefined || activity === undefined) {
		return rejectWithValue('nfc.startFailed');
	}

	dispatch(
		newTimesheetStarted({
			id: uuid.v4(),
			begin: new Date().toISOString(),
			project,
			activity,
		}),
	);
});
