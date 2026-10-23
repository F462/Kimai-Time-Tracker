import React, {useCallback, useState} from 'react';
import {FlatList} from 'react-native';
import {Divider} from 'react-native-paper';

export function DividedList<T>({
	data,
	renderItem,
	onRefresh,
	showDividers = false,
}: {
	data: Array<T>;
	renderItem: React.ComponentProps<typeof FlatList<T>>['renderItem'];
	onRefresh?: () => Promise<unknown>;
	showDividers?: boolean;
}) {
	const [refreshing, setRefreshing] = useState(false);
	const dividerCallback = useCallback(() => <Divider />, []);
	const refreshCallback = useCallback(() => {
		if (!onRefresh) {
			return;
		}

		setRefreshing(true);
		Promise.resolve()
			.then(onRefresh)
			.catch(console.warn)
			.finally(() => setRefreshing(false));
	}, [onRefresh]);

	return (
		<FlatList
			data={data}
			renderItem={renderItem}
			ItemSeparatorComponent={showDividers ? dividerCallback : undefined}
			refreshing={refreshing}
			onRefresh={onRefresh ? refreshCallback : undefined}
		/>
	);
}
