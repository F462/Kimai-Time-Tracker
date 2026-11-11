import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
	Button,
	Modal,
	Portal,
	Text,
	TextInput,
	useTheme,
} from 'react-native-paper';

import {selectActivities} from 'src/features/activities/context/activitiesSelectors';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {selectProjects} from 'src/features/projects/context/projectsSelectors';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {ActivitySelector} from 'src/ui/Selectors/ActivitySelector';
import {ProjectSelector} from 'src/ui/Selectors/ProjectSelector';
import {nfcTagUpdated} from '../context/nfcSlice';
import type {NfcTag} from '../types';

const styles = StyleSheet.create({
	modal: {
		padding: 20,
		margin: 16,
		maxHeight: '90%',
	},
	header: {
		marginBottom: 8,
	},
	groupLabel: {
		marginTop: 12,
		marginBottom: 4,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 16,
		gap: 12,
	},
});

type NfcTagModalProps = {
	tag: NfcTag;
	visible: boolean;
	onHideModal: () => void;
};

/**
 * Edit form for a known NFC tag: the display name and the optional project
 * and activity that should be used when the tag is scanned. Leaving the
 * project or activity unset makes the scan fall back to the currently
 * selected project and activity.
 */
export const NfcTagModal = ({tag, visible, onHideModal}: NfcTagModalProps) => {
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const {t} = useTranslation();
	const projects = useAppSelector(selectProjects);
	const activities = useAppSelector(selectActivities);
	const dynamicStyles = useStyle(
		() => ({
			modal: {backgroundColor: theme.colors.background},
			helpText: {color: theme.colors.onSurfaceVariant},
		}),
		[theme.colors.background, theme.colors.onSurfaceVariant],
	);

	const [name, setName] = useState('');
	const [projectId, setProjectId] = useState<number | undefined>();
	const [activityId, setActivityId] = useState<number | undefined>();

	useEffect(() => {
		if (!visible) {
			return;
		}
		setName(tag.name);
		setProjectId(tag.projectId);
		setActivityId(tag.activityId);
	}, [tag, visible]);

	const canSave = name.trim().length > 0;

	const onSave = useCallback(() => {
		if (!canSave) {
			return;
		}
		dispatch(
			nfcTagUpdated({
				id: tag.id,
				name: name.trim(),
				projectId: projectId ?? null,
				activityId: activityId ?? null,
			}),
		);
		onHideModal();
	}, [activityId, canSave, dispatch, name, onHideModal, projectId, tag.id]);

	const selectedProject =
		projectId === undefined ? undefined : projects[projectId];
	const selectedActivity =
		activityId === undefined ? undefined : activities[activityId];

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onHideModal}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<ScrollView>
					<View style={styles.header}>
						<Text variant="titleLarge">{t('nfc.editTag')}</Text>
					</View>
					<TextInput
						label={t('nfc.tagName')}
						mode="outlined"
						value={name}
						onChangeText={setName}
						autoCorrect={false}
					/>
					<View style={styles.groupLabel}>
						<Text variant="titleSmall">{t('nfc.projectLabel')}</Text>
						<Text variant="bodySmall" style={dynamicStyles.helpText}>
							{t('nfc.followSelectionHint')}
						</Text>
					</View>
					<ProjectSelector
						selectedProject={selectedProject}
						onSelectProject={(project) => setProjectId(project?.id)}
					/>
					<View style={styles.groupLabel}>
						<Text variant="titleSmall">{t('nfc.activityLabel')}</Text>
					</View>
					<ActivitySelector
						selectedActivity={selectedActivity}
						onSelectActivity={(activity) => setActivityId(activity?.id)}
					/>
					<View style={styles.buttonContainer}>
						<Button onPress={onHideModal}>{t('dismiss')}</Button>
						<Button onPress={onSave} mode="contained" disabled={!canSave}>
							{t('save')}
						</Button>
					</View>
				</ScrollView>
			</Modal>
		</Portal>
	);
};
