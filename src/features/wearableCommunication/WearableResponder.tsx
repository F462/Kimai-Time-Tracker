import {sendMessage, watchEvents} from '@d4l/react-native-wear-connectivity';
import {useCallback, useEffect} from 'react';
import {v4 as uuidv4} from 'uuid';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {TimesheetCreationState} from 'src/wearable/types';
import {newTimesheetStarted} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {selectActiveTimesheet} from 'src/features/timesheets/context/timesheetsSelectors';
import {selectCanTimesheetBeStarted} from 'src/features/activeTimesheet/context/activeTimesheetSelectors';
import {selectSelectedActivityId} from 'src/features/activities/context/activitiesSelectors';
import {selectSelectedProjectId} from 'src/features/projects/context/projectsSelectors';
import {stopActiveTimesheet} from 'src/features/activeTimesheet/middleware/activeTimesheetThunks';
import {wearableProtocol} from './Protocol';

export const WearableResponder = () => {
	const dispatch = useAppDispatch();
	const canTimesheetBeStarted = useAppSelector(selectCanTimesheetBeStarted);
	const selectedProjectId = useAppSelector(selectSelectedProjectId);
	const selectedActivityId = useAppSelector(selectSelectedActivityId);
	const timesheet = useAppSelector(selectActiveTimesheet);

	const activeTimesheetStatusPayload = (() => {
		if (!canTimesheetBeStarted) {
			return TimesheetCreationState.PROJECT_OR_ACTIVITY_NOT_SET;
		} else if (timesheet === undefined) {
			return TimesheetCreationState.NO_TIMESHEET_RUNNING;
		} else {
			return TimesheetCreationState.TIMESHEET_RUNNING;
		}
	})().toString();

	const sendActiveTimesheetStatus = useCallback(
		() =>
			sendMessage(
				{
					text: wearableProtocol.activeTimesheetStatusResponse,
					payload: activeTimesheetStatusPayload,
				},
				() => {},
				console.error,
			),
		[activeTimesheetStatusPayload],
	);

	useEffect(() => {
		const unsubscribe = watchEvents.on('message', (message) => {
			switch (message.text) {
				case wearableProtocol.activeTimesheetStatusRequest:
					sendActiveTimesheetStatus();
					break;
				case wearableProtocol.startNewTimesheet:
					dispatch(
						newTimesheetStarted({
							id: uuidv4(),
							begin: new Date().toISOString(),
							project: selectedProjectId,
							activity: selectedActivityId,
						}),
					);
					break;
				case wearableProtocol.stopRunningTimesheet:
					dispatch(stopActiveTimesheet()).catch(console.warn);
					break;
			}
		});

		return () => unsubscribe();
	}, [
		dispatch,
		selectedActivityId,
		selectedProjectId,
		sendActiveTimesheetStatus,
	]);

	useEffect(() => {
		sendActiveTimesheetStatus();
	}, [sendActiveTimesheetStatus]);

	return null;
};
