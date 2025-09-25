import {Button, Modal, Portal, Text, useTheme} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {useCallback, useState} from 'react';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {ActivitySelector} from 'src/ui/Selectors/ActivitySelector';
import {DateTimePicker} from 'src/ui/DateTimePicker';
import {ProjectSelector} from 'src/ui/Selectors/ProjectSelector';
import {Timesheet} from '../types';
import {selectActivity} from 'src/features/activities/context/activitiesSelectors';
import {selectProject} from 'src/features/projects/context/projectsSelectors';
import {timesheetEdited} from '../context/timesheetActions';
import {useStyle} from 'src/features/theming/utils/useStyle';

const styles = StyleSheet.create({
	modal: {
		padding: 20,
		margin: 20,
	},
	modalContent: {
		margin: 10,
	},
	datePickerWithLabel: {
		margin: 5,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
});

type DatePickerWithLabelType = React.ComponentProps<typeof DateTimePicker> & {
	label: string;
};
const DatePickerWithLabel = ({label, ...props}: DatePickerWithLabelType) => {
	return (
		<View style={styles.datePickerWithLabel}>
			<Text>{label}</Text>
			<DateTimePicker {...props} />
		</View>
	);
};

type EditTimesheetModalProps = {
	timesheet: Timesheet;
	visible: boolean;
	onHideModal: () => void;
};

export const EditTimesheetModal = ({
	timesheet,
	visible,
	onHideModal,
}: EditTimesheetModalProps) => {
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const {t} = useTranslation();

	const dynamicStyles = useStyle(
		() => ({
			modal: {
				backgroundColor: theme.colors.background,
			},
		}),
		[theme.colors.background],
	);

	const [timesheetBegin, setTimesheetBegin] = useState(
		timesheet.begin ? dayjs(timesheet.begin).unix() : undefined,
	);
	const [timesheetEnd, setTimesheetEnd] = useState(
		timesheet.end ? dayjs(timesheet.end).unix() : undefined,
	);

	const timesheetProject = useAppSelector(selectProject(timesheet.project));
	const [selectedProject, setSelectedProject] = useState(timesheetProject);

	const timesheetActivity = useAppSelector(selectActivity(timesheet.activity));
	const [selectedActivity, setSelectedActivity] = useState(timesheetActivity);

	const onSave = useCallback(() => {
		dispatch(
			timesheetEdited({
				...timesheet,
				begin: timesheetBegin ? dayjs.unix(timesheetBegin).format() : undefined,
				end: timesheetEnd ? dayjs.unix(timesheetEnd).format() : undefined,
				project: selectedProject?.id,
				activity: selectedActivity?.id,
			}),
		);
		onHideModal();
	}, [
		dispatch,
		onHideModal,
		selectedActivity?.id,
		selectedProject?.id,
		timesheet,
		timesheetBegin,
		timesheetEnd,
	]);

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onHideModal}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<Text variant="headlineSmall">{t('editTimesheet')}</Text>
				<View style={styles.modalContent}>
					<DatePickerWithLabel
						label="Begin:"
						initialValue={timesheetBegin}
						onDateTimePick={(pickedDateTime) => {
							setTimesheetBegin(pickedDateTime.unix());
						}}
					/>
					<DatePickerWithLabel
						label="End:"
						initialValue={timesheetEnd}
						onDateTimePick={(pickedDateTime) =>
							setTimesheetEnd(pickedDateTime.unix())
						}
					/>
					<ProjectSelector
						selectedProject={selectedProject}
						onSelectProject={setSelectedProject}
					/>
					<ActivitySelector
						selectedActivity={selectedActivity}
						onSelectActivity={setSelectedActivity}
					/>
				</View>
				<View style={styles.buttonContainer}>
					<Button onPress={onHideModal}>{t('dismiss')}</Button>
					<Button mode="contained" onPress={onSave}>
						{t('save')}
					</Button>
				</View>
			</Modal>
		</Portal>
	);
};
