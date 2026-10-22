import {useMemo} from 'react';
import {PaperSelect} from 'react-native-paper-select';

type BaseElement = {id: string | number; name: string};

type BaseMultiSelectorProps<T extends BaseElement> = {
	elements: Array<T>;
	selectedElements: Array<T>;
	label: string;
	/** Called with the selected elements whenever the dialog is confirmed. */
	onSelection: (selected: Array<T>) => void;
};

/**
 * A multi-select dropdown over a list of `{id, name}` entities (e.g. teams).
 * Mirrors {@link BaseSelector} but allows picking several items, which is
 * required for the project "Team" field (Kimai stores an array of team ids).
 */
export function BaseMultiSelector<T extends BaseElement>({
	elements,
	selectedElements,
	label,
	onSelection,
}: BaseMultiSelectorProps<T>) {
	const elementList = useMemo(
		() =>
			Object.values(elements ?? {}).map((item) => ({
				_id: item.id.toString(),
				value: item.name,
			})),
		[elements],
	);

	const selectedArrayList = useMemo(
		() =>
			(selectedElements ?? []).map((item) => ({
				_id: item.id.toString(),
				value: item.name,
			})),
		[selectedElements],
	);

	const displayValue =
		selectedElements.length > 0
			? selectedElements.map((element) => element.name).join(', ')
			: '';

	return (
		<PaperSelect
			label={label}
			value={displayValue}
			arrayList={elementList}
			selectedArrayList={selectedArrayList}
			multiEnable={true}
			hideSearchBox={true}
			textInputMode="outlined"
			onSelection={(selection) => {
				const selected = (selection.selectedList ?? []).map((item) =>
					elements.find((candidate) => candidate.id.toString() === item._id),
				);
				onSelection(
					selected.filter((element): element is T => element !== undefined),
				);
			}}
		/>
	);
}
