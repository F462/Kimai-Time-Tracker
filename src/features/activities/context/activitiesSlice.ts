import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {ActivitiesState, Activity} from '../types';

const initialState: ActivitiesState = {
	activities: {}
};

const activitiesSlice = createSlice({
	name: 'activities',
	initialState,
	reducers: {
		activitiesReceived: (state, {payload}: PayloadAction<Array<Activity>>) => {
			state.activities = payload.reduce(
				(container, element) => ({...container, [element.id]: element}),
				{}
			);
		}
	}
});

export const {activitiesReceived} = activitiesSlice.actions;
export const activitiesReducer = activitiesSlice.reducer;
