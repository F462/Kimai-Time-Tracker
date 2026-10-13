import React, {useMemo} from 'react';

import {BaseSelector} from './BaseSelector';

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
 * A single-select dropdown over a fixed list of options. Works with plain
 * `{value, label}` options instead of `{id, name}` entities.
 */
export function OptionSelector({
	options,
	selectedValue,
	label,
	onSelection,
}: OptionSelectorProps) {
	const elements = useMemo(
		() => options.map((option) => ({id: option.value, name: option.label})),
		[options],
	);

	const selectedElement = elements.find(
		(element) => element.id === selectedValue,
	);

	return (
		<BaseSelector
			elements={elements}
			selectedElement={selectedElement}
			label={label}
			onSelection={(data) => {
				const selected = data.selectedList[0];
				if (selected) {
					onSelection(selected._id);
				}
			}}
		/>
	);
}
