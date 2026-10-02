import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Modal, Portal, Text, useTheme} from 'react-native-paper';

import {useAppDispatch} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {removeActivity} from '../middleware/activitiesThunks';
import {Activity} from '../types';

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

type ActivityItemContextMenuProps = {
	activity: Activity;
	visible: boolean;
	onHideMenu: () => void;
};

export const ActivityItemContextMenu = ({
	activity,
	visible,
	onHideMenu,
}: ActivityItemContextMenuProps) => {
	const theme = useTheme();
	const {t} = useTranslation();
	const dispatch = useAppDispatch();

	const onConfirmDelete = useCallback(() => {
		dispatch(removeActivity(activity.id)).catch(console.error);
		onHideMenu();
	}, [activity.id, dispatch, onHideMenu]);

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
				<Text variant="headlineSmall">{t('deleteActivity')}</Text>
				<View style={styles.modalContent}>
					<Text>{t('deleteActivityWarning')}</Text>
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
