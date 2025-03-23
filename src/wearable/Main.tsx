import {StyleSheet, View} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {FileLogger} from 'react-native-file-logger';
import React from 'react';

import AppIcon from 'src/assets/icon.svg';
import {useStyle} from '../features/theming/utils/useStyle';
import {useTheme} from 'react-native-paper';

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	}
});

enum TimesheetCreationState {
	UNKNOWN = 0,
	PROJECT_OR_ACTIVITY_NOT_SET,
	NO_TIMESHEET_RUNNING,
	TIMESHEET_RUNNING
}

const ActivityComponent = () => {
	const timesheetCreationState = TimesheetCreationState.NO_TIMESHEET_RUNNING;
	const iconSize = 100;

	switch (timesheetCreationState) {
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
