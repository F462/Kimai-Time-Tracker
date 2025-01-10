import React from 'react';

import {selectActivityList, selectSelectedActivityId} from '../context/activitiesSelectors';
import {Activity} from '../types';
import {BaseScreen} from 'src/ui/BaseScreen';
import {DividedList} from 'src/ui/DividedList';
import {ListItem} from 'src/ui/ListItem';
import {ListItemText} from 'src/ui/ListItemText';
import {useAppSelector} from 'src/features/data/context/store';

const ActivityItem = ({activity, isSelected}: {activity: Activity; isSelected: boolean;}) => {
	return (
		<ListItem isSelected={isSelected}>
			<ListItemText>{activity.name}</ListItemText>
		</ListItem>
	);
};

const ActivityList = () => {
	const activityList = useAppSelector(selectActivityList);
	const selectedActivityId = useAppSelector(selectSelectedActivityId);

	return <DividedList data={activityList} renderItem={({item}) => <ActivityItem activity={item} isSelected={item.id === selectedActivityId} />} />;
};

export const ActivitiesScreen = () => {
	return <BaseScreen><ActivityList /></BaseScreen>;
};
