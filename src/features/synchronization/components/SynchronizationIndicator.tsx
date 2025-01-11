import React, {useMemo} from 'react';

import {Icon} from 'react-native-paper';

import {StyleSheet, View} from 'react-native';
import {selectAreAllTimesheetsInSync} from 'src/features/timesheets/context/timesheetsSelectors';
import {useAppSelector} from 'src/features/data/context/store';

const styles = StyleSheet.create({
	icon: {
		margin: 10
	}
});

export const SynchronizationIndicator = () => {
	const areAllTimesheetsInSync = useAppSelector(selectAreAllTimesheetsInSync);

	const iconToDisplay = useMemo(() => {
		const iconString = (() => {
			if (areAllTimesheetsInSync) {
				return 'cloud-check-outline';
			} else {
				return 'cloud-sync-outline';
			}
		})();

		return <View style={styles.icon}><Icon source={iconString} size={30} /></View>;
	}, [areAllTimesheetsInSync]);

	return iconToDisplay;
};
