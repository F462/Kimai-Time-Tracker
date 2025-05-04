import {List, Modal, Portal, useTheme} from 'react-native-paper';
import React, {useCallback} from 'react';
import {Style} from 'react-native-paper/lib/typescript/components/List/utils';
import {StyleSheet} from 'react-native';

import {
	deleteTimesheet,
	synchronizeTimesheet,
} from 'src/features/synchronization/middleware/synchronizationThunks';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {Timesheet} from '../types';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {useTranslation} from 'react-i18next';

const styles = StyleSheet.create({
	modal: {
		padding: 20,
		margin: 20,
	},
});

const useSynchronizeTimesheet = (timesheet: Timesheet) => {
	const dispatch = useAppDispatch();
	const serverUrl = useAppSelector(selectServerUrl);

	return useCallback(() => {
		if (serverUrl === undefined) {
			console.warn(
				`Server URL is not defined, cannot sync timesheet ${timesheet.id}`,
			);
			return;
		}

		dispatch(synchronizeTimesheet({serverUrl, timesheet})).catch(console.error);
	}, [dispatch, serverUrl, timesheet]);
};

const useDeleteTimesheet = (timesheet: Timesheet) => {
	const dispatch = useAppDispatch();
	const serverUrl = useAppSelector(selectServerUrl);

	return useCallback(() => {
		if (serverUrl === undefined) {
			console.warn(
				`Server URL is not defined, cannot delete timesheet ${timesheet.id}`,
			);
			return;
		}

		dispatch(deleteTimesheet({serverUrl, timesheet})).catch(console.error);
	}, [dispatch, serverUrl, timesheet]);
};

type TimesheetItemContextMenuProps = {
	timesheet: Timesheet;
	visible: boolean;
	onHideMenu: () => void;
};

export const TimesheetItemContextMenu = ({
	timesheet,
	visible,
	onHideMenu,
}: TimesheetItemContextMenuProps) => {
	const theme = useTheme();
	const {t} = useTranslation();
	const onSyncItemPressed = useSynchronizeTimesheet(timesheet);
	const onEditItemPressed = () => {};
	const onDeleteItemPressed = useDeleteTimesheet(timesheet);

	const dynamicStyles = useStyle(
		() => ({
			modal: {
				backgroundColor: theme.colors.background,
			},
		}),
		[theme.colors.background],
	);

	const modalEntries = [
		{
			text: t('synchronize'),
			icon: 'cloud-sync-outline',
			onPress: onSyncItemPressed,
		},
		{
			text: t('edit'),
			icon: 'pencil-outline',
			onPress: onEditItemPressed,
		},
		{
			text: t('delete'),
			icon: 'delete-outline',
			onPress: onDeleteItemPressed,
		},
	];

	const createListIcon = useCallback(
		(props: {color: string; style: Style}, iconName: string) => (
			<List.Icon {...props} icon={iconName} />
		),
		[],
	);

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onHideMenu}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<>
					{modalEntries.map((modalEntry) => {
						return (
							<List.Item
								key={modalEntry.text}
								title={modalEntry.text}
								onPress={() => {
									modalEntry.onPress();
									onHideMenu();
								}}
								left={(props) => createListIcon(props, modalEntry.icon)}
							/>
						);
					})}
				</>
			</Modal>
		</Portal>
	);
};
