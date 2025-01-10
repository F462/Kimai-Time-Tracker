import React from 'react';

import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import {Activity} from '../types';
import {DividedList} from 'src/ui/DividedList';
import {selectActivityList} from '../context/activitiesSelectors';
import {useAppSelector} from 'src/features/data/context/store';

const styles = StyleSheet.create({
	container: {
		margin: 10
	},
	itemContainer: {
		marginHorizontal: 10,
		marginVertical: 5
	}
});

const ActivityItem = ({activity}: {activity: Activity}) => {
	return (
		<View style={styles.itemContainer}>
			<Text>{activity.name}</Text>
		</View>
	);
};

const ActivityList = () => {
	const activityList = useAppSelector(selectActivityList);

	return <DividedList data={activityList} renderItem={({item}) => <ActivityItem activity={item} />} />;
};

export const ActivitiesScreen = () => {
	return <View style={styles.container}><ActivityList /></View>;
};
