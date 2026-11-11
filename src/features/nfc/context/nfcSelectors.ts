import {createSelector} from '@reduxjs/toolkit';

import type {RootState} from 'src/features/data/context/store';
import type {NfcTag} from '../types';

const selectNfcState = (state: RootState) => state.nfc;

export const selectNfcTags = createSelector(
	[selectNfcState],
	(nfc) => nfc.tags,
);

export const selectNfcTagList = createSelector([selectNfcTags], (tags) =>
	Object.values(tags),
);

export const selectNfcTag = (tagId: string | undefined) =>
	createSelector([selectNfcTags], (tags) =>
		tagId !== undefined ? tags[tagId] : undefined,
	);

export const selectIsNfcScanning = createSelector(
	[selectNfcState],
	(nfc) => nfc.isScanning,
);

export type {NfcTag};
