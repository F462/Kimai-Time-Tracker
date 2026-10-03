import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {FAB} from 'react-native-paper';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {BaseScreen} from 'src/ui/BaseScreen';
import {DividedList} from 'src/ui/DividedList';
import {EntityListItem} from 'src/ui/EntityListItem';
import {
	selectActivityList,
	selectSelectedActivityId,
} from '../context/activitiesSelectors';
import {activitySelected} from '../context/activitiesSlice';
import {Activity} from '../types';
import {ActivityItemContextMenu} from './ActivityItemContextMenu';
import {AddActivityModal} from './AddActivityModal';

const styles = StyleSheet.create({
	fab: {
		position: 'absolute',
		right: 20,
		bottom: 20,
	},
});

const ActivityItem = ({
	activity,
	isSelected,
}: {
	activity: Activity;
	isSelected: boolean;
}) => {
	const dispatch = useAppDispatch();
	const [contextMenuVisible, setContextMenuVisible] = useState(false);

	const onSelectActivity = useCallback(() => {
		dispatch(activitySelected(activity.id));
	}, [dispatch, activity.id]);
	const onOpenContextMenu = useCallback(() => setContextMenuVisible(true), []);
	const onHideContextMenu = useCallback(() => setContextMenuVisible(false), []);

	return (
		<EntityListItem
			name={activity.name}
			isSelected={isSelected}
			onPress={onSelectActivity}
			onLongPress={onOpenContextMenu}
			contextMenu={
				<ActivityItemContextMenu
					activity={activity}
					visible={contextMenuVisible}
					onHideMenu={onHideContextMenu}
				/>
			}
		/>
	);
};

const ActivityList = () => {
	const activityList = useAppSelector(selectActivityList);
	const selectedActivityId = useAppSelector(selectSelectedActivityId);

	return (
		<DividedList
			data={activityList}
			renderItem={({item}) => (
				<ActivityItem
					activity={item}
					isSelected={item.id === selectedActivityId}
				/>
			)}
		/>
	);
};

export const ActivitiesScreen = () => {
	const {t} = useTranslation();
	const [addModalVisible, setAddModalVisible] = useState(false);

	const onShowAddModal = useCallback(() => setAddModalVisible(true), []);
	const onHideAddModal = useCallback(() => setAddModalVisible(false), []);

	return (
		<BaseScreen>
			<ActivityList />
			<FAB
				icon="plus"
				label={t('addActivity')}
				onPress={onShowAddModal}
				style={styles.fab}
			/>
			<AddActivityModal
				visible={addModalVisible}
				onHideModal={onHideAddModal}
			/>
		</BaseScreen>
	);
};
