import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import type {NfcState, NfcTag} from '../types';

const initialState: NfcState = {
	tags: {},
	isScanning: false,
	reprogrammingTagId: undefined,
};

export type NfcTagUpdate = {
	id: string;
	name?: string;
	projectId?: number | null;
	activityId?: number | null;
};

const nfcSlice = createSlice({
	name: 'nfc',
	initialState,
	reducers: {
		nfcTagAdded(state, action: PayloadAction<NfcTag>) {
			state.tags[action.payload.id] = action.payload;
		},
		nfcTagUpdated(state, action: PayloadAction<NfcTagUpdate>) {
			const tag = state.tags[action.payload.id];
			if (!tag) {
				return;
			}
			if (action.payload.name !== undefined) {
				tag.name = action.payload.name;
			}
			if (action.payload.projectId !== undefined) {
				tag.projectId = action.payload.projectId ?? undefined;
			}
			if (action.payload.activityId !== undefined) {
				tag.activityId = action.payload.activityId ?? undefined;
			}
		},
		nfcTagRemoved(state, action: PayloadAction<string>) {
			delete state.tags[action.payload];
		},
		nfcScanningStarted(state) {
			state.isScanning = true;
			// Scanning and re-programming are mutually exclusive modes.
			state.reprogrammingTagId = undefined;
		},
		nfcScanningStopped(state) {
			state.isScanning = false;
		},
		nfcReprogrammingStarted(state, action: PayloadAction<string>) {
			state.reprogrammingTagId = action.payload;
			// Scanning and re-programming are mutually exclusive modes.
			state.isScanning = false;
		},
		nfcReprogrammingStopped(state) {
			state.reprogrammingTagId = undefined;
		},
	},
});

export const {
	nfcTagAdded,
	nfcTagUpdated,
	nfcTagRemoved,
	nfcScanningStarted,
	nfcScanningStopped,
	nfcReprogrammingStarted,
	nfcReprogrammingStopped,
} = nfcSlice.actions;

export const nfcReducer = nfcSlice.reducer;
