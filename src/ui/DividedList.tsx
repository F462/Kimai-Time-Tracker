import React, {useCallback} from 'react';

import {Divider} from 'react-native-paper';
import {FlatList} from 'react-native';

export function DividedList<T>({
	data,
	renderItem
}: {
	data: Array<T>;
	renderItem: React.ComponentProps<typeof FlatList<T>>['renderItem'];
}) {
	const dividerCallback = useCallback(() => <Divider />, []);

	return (
		<FlatList
			data={data}
			renderItem={renderItem}
			ItemSeparatorComponent={dividerCallback}
		/>
	);
}
