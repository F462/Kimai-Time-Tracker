import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {sendMessage, watchEvents} from '@d4l/react-native-wear-connectivity';
import BootSplash from 'react-native-bootsplash';
import {FileLogger} from 'react-native-file-logger';

import {TimesheetCreationState} from './types';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {wearableProtocol} from 'src/features/wearableCommunication/Protocol';

import AppIcon from 'src/assets/icon.svg';
import {useTranslation} from 'react-i18next';

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	chooseProjectActivityText: {
		textAlign: 'center'
	}
});

const useTimesheetCreationState = () => {
	const [timesheetCreationState, setTimesheetCreationState] =
		useState<TimesheetCreationState>();

	useEffect(() => {
		sendMessage(
			{text: wearableProtocol.activeTimesheetStatusRequest},
			() => {},
			FileLogger.error
		);
	}, []);

	useEffect(() => {
		const unsubscribe = watchEvents.on('message', message => {
			switch (message.text) {
				case wearableProtocol.activeTimesheetStatusResponse:
					setTimesheetCreationState(
						(() => {
							try {
								return parseInt(message.payload, 10);
							} catch (error: any) {
								FileLogger.error(
									`Error while parsing active timesheet status: ${error.toString()}`
								);
								return TimesheetCreationState.UNKNOWN;
							}
						})()
					);
			}
		});

		() => unsubscribe();
	}, []);

	return timesheetCreationState;
};

const ChooseProjectAndActivityText = () => {
	const {t} = useTranslation();

	return (
		<Text style={styles.chooseProjectActivityText}>
			{t('chooseProjectAndActivity')}
		</Text>
	);
};

const ActivityComponent = () => {
	const iconSize = 100;

	const timesheetCreationState = useTimesheetCreationState();

	switch (timesheetCreationState) {
		case TimesheetCreationState.PROJECT_OR_ACTIVITY_NOT_SET:
			return <ChooseProjectAndActivityText />;
		case TimesheetCreationState.NO_TIMESHEET_RUNNING:
			return <AppIcon width={iconSize} height={iconSize} />;
		default:
			return null;
	}
};

const MainDisplay = () => {
	const theme = useTheme();

	const dynamicStyles = useStyle(
		() => ({
			mainContainer: {
				backgroundColor: theme.colors.background
			}
		}),
		[theme.colors.background]
	);

	return (
		<View style={[styles.mainContainer, dynamicStyles.mainContainer]}>
			<ActivityComponent />
		</View>
	);
};

export const AppOnWearable = () => {
	React.useEffect(() => {
		BootSplash.hide().catch(FileLogger.error);
	}, []);

	return <MainDisplay />;
};
