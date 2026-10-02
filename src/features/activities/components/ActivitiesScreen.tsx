import React, {useCallback, useState} from 'react';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {BaseScreen} from 'src/ui/BaseScreen';
import {DividedList} from 'src/ui/DividedList';
import {ListItem} from 'src/ui/ListItem';
import {ListItemText} from 'src/ui/ListItemText';
import {
	selectActivityList,
	selectSelectedActivityId,
} from '../context/activitiesSelectors';
import {activitySelected} from '../context/activitiesSlice';
import {Activity} from '../types';
import {ActivityItemContextMenu} from './ActivityItemContextMenu';

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
		<>
			<ActivityItemContextMenu
				activity={activity}
				visible={contextMenuVisible}
				onHideMenu={onHideContextMenu}
			/>
			<ListItem
				isSelected={isSelected}
				onPress={onSelectActivity}
				onLongPress={onOpenContextMenu}>
				<ListItemText>{activity.name}</ListItemText>
			</ListItem>
		</>
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
	return (
		<BaseScreen>
			<ActivityList />
		</BaseScreen>
	);
};
