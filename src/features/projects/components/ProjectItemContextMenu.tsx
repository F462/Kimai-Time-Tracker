import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Modal, Portal, Text, useTheme} from 'react-native-paper';

import {useAppDispatch} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {removeProject} from '../middleware/projectsThunks';
import {Project} from '../types';

const styles = StyleSheet.create({
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},
	modal: {
		margin: 20,
		padding: 20,
	},
	modalContent: {
		marginVertical: 10,
	},
});

type ProjectItemContextMenuProps = {
	project: Project;
	visible: boolean;
	onHideMenu: () => void;
};

export const ProjectItemContextMenu = ({
	project,
	visible,
	onHideMenu,
}: ProjectItemContextMenuProps) => {
	const theme = useTheme();
	const {t} = useTranslation();
	const dispatch = useAppDispatch();

	const onConfirmDelete = useCallback(() => {
		dispatch(removeProject(project.id)).catch(console.error);
		onHideMenu();
	}, [project.id, dispatch, onHideMenu]);

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
				onDismiss={onHideMenu}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<Text variant="headlineSmall">{t('deleteProject')}</Text>
				<View style={styles.modalContent}>
					<Text>{t('deleteProjectWarning')}</Text>
				</View>
				<View style={styles.buttonContainer}>
					<Button onPress={onHideMenu}>{t('dismiss')}</Button>
					<Button mode="contained" onPress={onConfirmDelete}>
						{t('delete')}
					</Button>
				</View>
			</Modal>
		</Portal>
	);
};
