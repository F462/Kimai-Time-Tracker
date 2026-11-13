import uuid from 'react-native-uuid';
import NfcManager, {Ndef} from 'react-native-nfc-manager';

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
 * Custom MIME type written into the NDEF record of every registered tag.
 * The Android manifest declares an `NDEF_DISCOVERED` intent filter scoped to
 * this MIME type, so a tap on a programmed tag is routed directly to this
 * app — the OS no longer shows the "Open with…" disambiguation dialog.
 * The literal string must match `android:mimeType` in AndroidManifest.xml.
 */
const NFC_TAG_MIME_TYPE = 'application/x.kimai';

/**
 * Writes the `application/x.kimai` NDEF MIME record to the currently scanned
 * tag. This is a best-effort operation: a tag that is read-only, lacks NDEF
 * support, or otherwise cannot be written is still registered, it simply
 * loses the "open without dialog" optimisation.
 */
const writeTagNdef = async (): Promise<void> => {
	try {
		const record = Ndef.mimeMediaRecord(NFC_TAG_MIME_TYPE, []);
		const bytes = Ndef.encodeMessage([record]);
		await NfcManager.writeNdefMessage(bytes);
	} catch (error) {
		console.warn('Failed to write NDEF record to NFC tag', error);
	}
};

/**
 * Registers a newly scanned NFC tag with a default name derived from its
 * UID, programs the tag with the `application/x.kimai` NDEF record (so
 * future taps route directly to this app without the OS disambiguation
 * dialog), and exits scanning mode.
 */
export const nfcRegisterTag = createAppAsyncThunk<
	string,
	string,
	{
		state: RootState;
		dispatch: AppDispatch;
	}
>('nfc/registerTag', async (tagId, {dispatch}) => {
	// Program the tag while the NFC session is still active. Failures are
	// swallowed inside `writeTagNdef` so that registration always succeeds,
	// even for read-only or non-NDEF tags.
	await writeTagNdef();
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
