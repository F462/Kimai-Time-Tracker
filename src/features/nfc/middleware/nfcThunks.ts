import NfcManager, {Ndef} from 'react-native-nfc-manager';
import uuid from 'react-native-uuid';

import {selectActiveTimesheetId} from 'src/features/activeTimesheet/context/activeTimesheetSelectors';
import {newTimesheetStarted} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {stopActiveTimesheet} from 'src/features/activeTimesheet/middleware/activeTimesheetThunks';
import {selectSelectedActivityId} from 'src/features/activities/context/activitiesSelectors';
import {AppDispatch, RootState} from 'src/features/data/context/store';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {selectSelectedProjectId} from 'src/features/projects/context/projectsSelectors';
import {
	selectIsNfcScanning,
	selectNfcReprogrammingTagId,
	selectNfcTag,
} from '../context/nfcSelectors';
import {
	nfcReprogrammingStopped,
	nfcScanningStopped,
	nfcTagAdded,
} from '../context/nfcSlice';

/**
 * Custom MIME type written into the NDEF record of every registered tag.
 * The Android manifest declares an `NDEF_DISCOVERED` intent filter scoped to
 * this MIME type, so a tap on a programmed tag is routed directly to this
 * app — the OS no longer shows the "Open with…" disambiguation dialog.
 * The literal string must match `android:mimeType` in AndroidManifest.xml.
 */
const NFC_TAG_MIME_TYPE = 'application/x.kimai';

/**
 * The outcome of programming a physical tag: whether the NDEF record was
 * actually written. A failed programming still allows the tag to be
 * registered (UID-based matching works in the foreground), but the tag will
 * not be routed to the app from the background.
 */
export type NfcProgrammingResult = {
	id: string;
	programmed: boolean;
};

/**
 * The outcome of a tag detection that involved programming the physical tag
 * (registering it, or re-programming it), so the caller can surface a
 * failed programming and distinguish the two flows.
 */
export type NfcTagDetectionResult =
	| {kind: 'registered'; programmed: boolean}
	| {kind: 'reprogrammed'; programmed: boolean};

/**
 * Writes the `application/x.kimai` NDEF MIME record to the currently scanned
 * tag. Returns `false` instead of throwing when the tag is read-only, lacks
 * NDEF support, or otherwise cannot be written, so the caller can surface
 * the failed programming while the registration itself still succeeds.
 */
const writeTagNdef = async (): Promise<boolean> => {
	try {
		const record = Ndef.record(Ndef.TNF_MIME_MEDIA, NFC_TAG_MIME_TYPE, [], []);
		const bytes = Ndef.encodeMessage([record]);
		await NfcManager.writeNdefMessage(bytes);
		return true;
	} catch (error) {
		console.warn('Failed to write NDEF record to NFC tag', error);
		return false;
	}
};

/**
 * Registers a newly scanned NFC tag with a default name derived from its
 * UID, programs the tag with the `application/x.kimai` NDEF record (so
 * future taps route directly to this app without the OS disambiguation
 * dialog), and exits scanning mode. The programming result is returned so
 * the caller can inform the user when the tag could not be programmed.
 */
export const nfcRegisterTag = createAppAsyncThunk<
	NfcProgrammingResult,
	string,
	{
		state: RootState;
		dispatch: AppDispatch;
	}
>('nfc/registerTag', async (tagId, {dispatch}) => {
	// Program the tag while the NFC session is still active. Failures are
	// reported via the return value so the caller can surface them; the
	// registration itself always succeeds, even for read-only or non-NDEF
	// tags.
	const programmed = await writeTagNdef();
	const name = `NFC ${tagId.slice(-4)}`;
	dispatch(nfcTagAdded({id: tagId, name}));
	dispatch(nfcScanningStopped());
	return {id: tagId, programmed};
});

/**
 * (Re-)writes the `application/x.kimai` NDEF record to an already registered
 * tag whose initial programming failed or was performed before the MIME
 * record existed. Must run while the tag is held against the device, i.e.
 * inside the `DiscoverTag` event of a foreground tap.
 */
export const nfcReprogramTag = createAppAsyncThunk<
	NfcProgrammingResult,
	string,
	{
		state: RootState;
		dispatch: AppDispatch;
	}
>('nfc/reprogramTag', async (tagId) => {
	const programmed = await writeTagNdef();
	return {id: tagId, programmed};
});

/**
 * Handles an NFC tag detection:
 * - If re-programming mode is active for this tag, the `application/x.kimai`
 *   NDEF record is (re-)written and the mode exits.
 * - If scanning is active, the tag is registered as a new known tag.
 * - Otherwise the scanned tag must already be a known tag: it is used to
 *   toggle the active timesheet (stopping the running one, or starting a new
 *   one). When the scanned tag has a configured project and activity, those
 *   are used; otherwise the currently selected project and activity are used
 *   (an NFC attendance recorder).
 *
 * Fulfils with the programming result for the register and re-program paths
 * (so the caller can surface a failed programming), or `undefined` for the
 * timesheet toggle. Rejects with an i18n key when the tag is unknown or a
 * timesheet cannot be started, so the caller can surface the reason to the
 * user.
 */
export const nfcTagDetected = createAppAsyncThunk<
	NfcTagDetectionResult | undefined,
	string,
	{
		state: RootState;
		dispatch: AppDispatch;
		rejectedValue: string;
	}
>('nfc/tagDetected', async (tagId, {dispatch, getState, rejectWithValue}) => {
	const state = getState();

	if (selectNfcReprogrammingTagId(state) === tagId) {
		const result = await dispatch(nfcReprogramTag(tagId));
		dispatch(nfcReprogrammingStopped());
		if (nfcReprogramTag.fulfilled.match(result)) {
			return {kind: 'reprogrammed', programmed: result.payload.programmed};
		}
		return {kind: 'reprogrammed', programmed: false};
	}

	if (selectIsNfcScanning(state)) {
		const result = await dispatch(nfcRegisterTag(tagId));
		if (nfcRegisterTag.fulfilled.match(result)) {
			return {kind: 'registered', programmed: result.payload.programmed};
		}
		return;
	}

	if (selectNfcReprogrammingTagId(state) !== undefined) {
		return rejectWithValue('nfc.unknownTag');
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
