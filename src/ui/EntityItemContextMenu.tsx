import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, List, Modal, Portal, Text, useTheme} from 'react-native-paper';
import {Style} from 'react-native-paper/lib/typescript/components/List/utils';

import {useStyle} from 'src/features/theming/utils/useStyle';

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

export type EntityItemContextMenuProps = {
	/** Whether the context menu itself is visible. */
	visible: boolean;
	/** Hides the context menu. */
	onHideMenu: () => void;
	/** Title of the deletion confirmation, e.g. `t('deleteActivity')`. */
	deleteTitle: string;
	/** Warning text shown in the deletion confirmation. */
	deleteWarning: string;
	/** Called when the user confirms the deletion in the confirmation dialog. */
	onConfirmDelete: () => void;
};

/**
 * Context menu for entity list items (activities, customers, projects, …).
 *
 * It opens on long press of the item and is an intermediate step before the
 * deletion process is triggered: choosing "Delete" in the menu shows the
 * confirmation dialog whose warning is provided via {@link deleteWarning}.
 * The menu can be extended with further actions (e.g. edit, synchronize) in
 * the same way as the timesheet context menu.
 */
export const EntityItemContextMenu = ({
	visible,
	onHideMenu,
	deleteTitle,
	deleteWarning,
	onConfirmDelete,
}: EntityItemContextMenuProps) => {
	const theme = useTheme();
	const {t} = useTranslation();

	const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
		useState(false);

	const onOpenDeleteConfirmation = useCallback(() => {
		onHideMenu();
		setDeleteConfirmationVisible(true);
	}, [onHideMenu]);

	const onHideDeleteConfirmation = useCallback(() => {
		setDeleteConfirmationVisible(false);
	}, []);

	const onConfirmDeletePressed = useCallback(() => {
		setDeleteConfirmationVisible(false);
		onConfirmDelete();
	}, [onConfirmDelete]);

	const dynamicStyles = useStyle(
		() => ({
			modal: {
				backgroundColor: theme.colors.background,
			},
		}),
		[theme.colors.background],
	);

	const createListIcon = useCallback(
		(props: {color: string; style: Style}, iconName: string) => (
			<List.Icon {...props} icon={iconName} />
		),
		[],
	);

	return (
		<Portal>
			<Modal
				visible={deleteConfirmationVisible}
				onDismiss={onHideDeleteConfirmation}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<Text variant="headlineSmall">{deleteTitle}</Text>
				<View style={styles.modalContent}>
					<Text>{deleteWarning}</Text>
				</View>
				<View style={styles.buttonContainer}>
					<Button onPress={onHideDeleteConfirmation}>{t('dismiss')}</Button>
					<Button mode="contained" onPress={onConfirmDeletePressed}>
						{t('delete')}
					</Button>
				</View>
			</Modal>
			<Modal
				visible={visible}
				onDismiss={onHideMenu}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<List.Item
					title={t('delete')}
					onPress={onOpenDeleteConfirmation}
					left={(props) => createListIcon(props, 'delete-outline')}
				/>
			</Modal>
		</Portal>
	);
};
