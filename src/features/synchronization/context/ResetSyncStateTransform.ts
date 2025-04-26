import _ from 'lodash';
import {createTransform} from 'redux-persist';

import {SyncState, SynchronizationState} from '../types';

export const ResetSyncStateTransform = createTransform(
	undefined,
	// transform state being rehydrated
	(outboundState: SynchronizationState) => {
		// convert mySet back to a Set.
		return _.mapValues(outboundState, (state) =>
			_.mapValues(state, (syncState) => {
				if (syncState === SyncState.RUNNING) {
					return SyncState.NOT_STARTED;
				} else {
					return syncState;
				}
			}),
		);
	},
	// define which reducers this transform gets called for.
	{whitelist: ['synchronization']},
);
