import {sendMessage, watchEvents} from '@d4l/react-native-wear-connectivity';
import {useCallback, useEffect} from 'react';
import {FileLogger} from 'react-native-file-logger';

import {TimesheetCreationState} from 'src/wearable/types';
import {selectActiveTimesheet} from 'src/features/timesheets/context/timesheetsSelectors';
import {selectCanTimesheetBeStarted} from 'src/features/activeTimesheet/context/activeTimesheetSelectors';
import {useAppSelector} from 'src/features/data/context/store';
import {wearableProtocol} from './Protocol';

export const WearableResponder = () => {
	const canTimesheetBeStarted = useAppSelector(selectCanTimesheetBeStarted);
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
					payload: activeTimesheetStatusPayload
				},
				() => {},
				FileLogger.error
			),
		[activeTimesheetStatusPayload]
	);

	useEffect(() => {
		const unsubscribe = watchEvents.on('message', message => {
			switch (message.text) {
				case wearableProtocol.activeTimesheetStatusRequest:
					sendActiveTimesheetStatus();
			}
		});

		return () => unsubscribe();
	}, [sendActiveTimesheetStatus]);

	useEffect(() => {
		sendActiveTimesheetStatus();
	}, [sendActiveTimesheetStatus]);

	return null;
};
