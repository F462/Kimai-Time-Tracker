import React, {useMemo} from 'react';
import {PaperSelect} from 'react-native-paper-select';

type BaseSelectorProps<T extends {id: number; name: string}> = {
	elements: Array<T>;
	selectedElement: T | undefined;
	label: string;
	onSelection: React.ComponentProps<typeof PaperSelect>['onSelection'];
};
export function BaseSelector<T extends {id: number; name: string}>({
	elements,
	selectedElement,
	label,
	onSelection,
}: BaseSelectorProps<T>) {
	const elementList = useMemo(() => {
		return Object.values(elements ?? {}).map((item) => ({
			_id: item.id.toString(),
			value: item.name,
		}));
	}, [elements]);

	return (
		<PaperSelect
			label={label}
			value={selectedElement?.name ?? ''}
			onSelection={onSelection}
			arrayList={elementList}
			selectedArrayList={[
				{
					_id: selectedElement?.id.toString() ?? '',
					value: selectedElement?.name ?? '',
				},
			]}
			multiEnable={false}
			hideSearchBox={true}
			textInputMode="outlined"
		/>
	);
}
