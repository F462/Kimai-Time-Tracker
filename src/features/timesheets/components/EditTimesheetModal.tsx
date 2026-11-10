import dayjs from 'dayjs';
import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {
	Button,
	Modal,
	Portal,
	SegmentedButtons,
	Text,
	useTheme,
} from 'react-native-paper';

import {selectActivity} from 'src/features/activities/context/activitiesSelectors';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {selectProject} from 'src/features/projects/context/projectsSelectors';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {DateTimePicker} from 'src/ui/DateTimePicker';
import {ActivitySelector} from 'src/ui/Selectors/ActivitySelector';
import {ProjectSelector} from 'src/ui/Selectors/ProjectSelector';
import {timesheetEdited} from '../context/timesheetActions';
import {Timesheet} from '../types';

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
	segmentedButtons: {
		marginVertical: 10,
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

type EndMode = 'ongoing' | 'fixed';

type EditTimesheetModalProps = {
	timesheet: Timesheet;
	visible: boolean;
	onHideModal: () => void;
};

type EditTimesheetFormProps = {
	timesheet: Timesheet;
	onHideModal: () => void;
};

const EditTimesheetForm = ({
	timesheet,
	onHideModal,
}: EditTimesheetFormProps) => {
	const dispatch = useAppDispatch();
	const {t} = useTranslation();

	const [timesheetBegin, setTimesheetBegin] = useState(
		timesheet.begin ? dayjs(timesheet.begin).unix() : undefined,
	);
	const [timesheetEnd, setTimesheetEnd] = useState(
		timesheet.end ? dayjs(timesheet.end).unix() : undefined,
	);
	const [endMode, setEndMode] = useState<EndMode>(
		timesheet.end ? 'fixed' : 'ongoing',
	);

	const timesheetProject = useAppSelector(selectProject(timesheet.project));
	const [selectedProject, setSelectedProject] = useState(timesheetProject);

	const timesheetActivity = useAppSelector(selectActivity(timesheet.activity));
	const [selectedActivity, setSelectedActivity] = useState(timesheetActivity);

	const handleEndModeChange = useCallback(
		(value: string) => {
			setEndMode(value as EndMode);
			if (value === 'fixed' && timesheetEnd == null) {
				setTimesheetEnd(dayjs().unix());
			}
		},
		[timesheetEnd],
	);

	const onSave = useCallback(() => {
		const resolvedEnd =
			endMode === 'ongoing'
				? null
				: dayjs.unix(timesheetEnd ?? dayjs().unix()).format();
		dispatch(
			timesheetEdited({
				...timesheet,
				begin: timesheetBegin ? dayjs.unix(timesheetBegin).format() : undefined,
				end: resolvedEnd,
				project: selectedProject?.id,
				activity: selectedActivity?.id,
			}),
		);
		onHideModal();
	}, [
		dispatch,
		endMode,
		onHideModal,
		selectedActivity?.id,
		selectedProject?.id,
		timesheet,
		timesheetBegin,
		timesheetEnd,
	]);

	return (
		<>
			<Text variant="headlineSmall">{t('editTimesheet')}</Text>
			<View style={styles.modalContent}>
				<DatePickerWithLabel
					label="Begin:"
					initialValue={timesheetBegin}
					onDateTimePick={(pickedDateTime) => {
						setTimesheetBegin(pickedDateTime.unix());
					}}
				/>
				<View style={styles.datePickerWithLabel}>
					<Text>End:</Text>
					<SegmentedButtons
						style={styles.segmentedButtons}
						value={endMode}
						onValueChange={handleEndModeChange}
						buttons={[
							{value: 'ongoing', label: t('now')},
							{value: 'fixed', label: t('specificTime')},
						]}
					/>
					{endMode === 'fixed' && (
						<DateTimePicker
							initialValue={timesheetEnd ?? dayjs().unix()}
							onDateTimePick={(pickedDateTime) =>
								setTimesheetEnd(pickedDateTime.unix())
							}
						/>
					)}
				</View>
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
		</>
	);
};

export const EditTimesheetModal = ({
	timesheet,
	visible,
	onHideModal,
}: EditTimesheetModalProps) => {
	const theme = useTheme();

	const dynamicStyles = useStyle(
		() => ({
			modal: {
				backgroundColor: theme.colors.background,
			},
		}),
		[theme.colors.background],
	);

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onHideModal}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				{/*
				 * Mount the form only while the modal is open, so that its
				 * state (begin/end times, end mode, project and activity)
				 * is re-initialized from the current timesheet on every
				 * open. Otherwise a timesheet that became completed after
				 * the list item was rendered would still default its end
				 * time to "now" instead of the stored end time.
				 */}
				{visible && (
					<EditTimesheetForm timesheet={timesheet} onHideModal={onHideModal} />
				)}
			</Modal>
		</Portal>
	);
};
