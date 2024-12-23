import React from 'react';

import {FlatList, View} from 'react-native';
import {Text} from 'react-native-paper';

import {Activity} from '../types';
import {selectActivityList} from '../context/activitiesSelectors';
import {useAppSelector} from 'src/features/data/context/store';

const ActivityItem = ({activity}: {activity: Activity}) => {
	return <View>
		<Text>{activity.name}</Text>
	</View>;
};

const ActivityList = () => {
	const activityList = useAppSelector(selectActivityList);

	return <FlatList data={activityList} renderItem={({item}) => <ActivityItem activity={item} />} />;
};

export const ActivitiesScreen = () => {
	return <View><ActivityList /></View>;
};
