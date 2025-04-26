import React, {useCallback} from 'react';

import {
	selectActivityList,
	selectSelectedActivityId,
} from '../context/activitiesSelectors';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {Activity} from '../types';
import {BaseScreen} from 'src/ui/BaseScreen';
import {DividedList} from 'src/ui/DividedList';
import {ListItem} from 'src/ui/ListItem';
import {ListItemText} from 'src/ui/ListItemText';
import {activitySelected} from '../context/activitiesSlice';

const ActivityItem = ({
	activity,
	isSelected,
}: {
	activity: Activity;
	isSelected: boolean;
}) => {
	const dispatch = useAppDispatch();
	const onProjectItemPress = useCallback(() => {
		dispatch(activitySelected(activity.id));
	}, [dispatch, activity.id]);

	return (
		<ListItem isSelected={isSelected} onPress={onProjectItemPress}>
			<ListItemText>{activity.name}</ListItemText>
		</ListItem>
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
