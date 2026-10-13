import React, {useMemo} from 'react';
import {PaperSelect} from 'react-native-paper-select';

type Option = {
	value: string;
	label: string;
};

type OptionSelectorProps = {
	options: Array<Option>;
	selectedValue: string;
	label: string;
	onSelection: (value: string) => void;
};

/**
 * A single-select dropdown over a fixed list of options. Follows the same
 * visual style as `BaseSelector` (outlined text input) but works with plain
 * `{value, label}` options instead of `{id, name}` entities.
 */
export function OptionSelector({
	options,
	selectedValue,
	label,
	onSelection,
}: OptionSelectorProps) {
	const arrayList = useMemo(
		() => options.map((option) => ({_id: option.value, value: option.label})),
		[options],
	);

	const selectedOption = options.find(
		(option) => option.value === selectedValue,
	);

	const selectedArrayList = useMemo(() => {
		return selectedOption
			? [{_id: selectedOption.value, value: selectedOption.label}]
			: [];
	}, [selectedOption]);

	return (
		<PaperSelect
			label={label}
			value={selectedOption?.label ?? ''}
			onSelection={(data) => {
				const selected = data.selectedList[0];
				if (selected) {
					onSelection(selected._id);
				}
			}}
			arrayList={arrayList}
			selectedArrayList={selectedArrayList}
			multiEnable={false}
			hideSearchBox={true}
			textInputMode="outlined"
		/>
	);
}
