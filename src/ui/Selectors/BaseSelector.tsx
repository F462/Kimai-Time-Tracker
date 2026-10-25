import React, {useMemo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Icon, Text, TextInput, useTheme} from 'react-native-paper';
import {PaperSelect} from 'react-native-paper-select';

type BaseElement = {id: string | number; name: string};

type BaseSelectorProps<T extends BaseElement> = {
	elements: Array<T>;
	selectedElement: T | undefined;
	label: string;
	emptyOptionLabel?: string;
	onSelection: React.ComponentProps<typeof PaperSelect>['onSelection'];
	/**
	 * Optional. Renders a leading element (e.g. a color swatch or an icon)
	 * before the label of the selected element and of every list item.
	 */
	renderLeadingElement?: (element: T, isSelected: boolean) => React.ReactNode;
};

const styles = StyleSheet.create({
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 48,
		paddingHorizontal: 16,
		gap: 12,
	},
	optionLabel: {
		flex: 1,
	},
	checkboxContainer: {
		width: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	checkVisible: {opacity: 1},
	checkHidden: {opacity: 0},
});

export function BaseSelector<T extends BaseElement>({
	elements,
	selectedElement,
	label,
	emptyOptionLabel,
	onSelection,
	renderLeadingElement,
}: BaseSelectorProps<T>) {
	const theme = useTheme();
	const elementList = useMemo(() => {
		const items = Object.values(elements ?? {}).map((item) => ({
			_id: item.id.toString(),
			value: item.name,
		}));
		return emptyOptionLabel
			? [{_id: '', value: emptyOptionLabel}, ...items]
			: items;
	}, [elements, emptyOptionLabel]);

	const selectedArrayList = useMemo(() => {
		return [
			{
				_id: selectedElement?.id.toString() ?? '',
				value: selectedElement?.name ?? emptyOptionLabel ?? '',
			},
		];
	}, [emptyOptionLabel, selectedElement?.id, selectedElement?.name]);

	const selectedForDisplay = selectedElement ?? elements[0];

	return (
		<PaperSelect
			label={label}
			value={selectedElement?.name ?? emptyOptionLabel ?? ''}
			onSelection={onSelection}
			arrayList={elementList}
			selectedArrayList={selectedArrayList}
			multiEnable={false}
			hideSearchBox={true}
			textInputMode="outlined"
			// react-native-paper-select defaults the outline to 'black',
			// which looks broken in dark mode. Match react-native-paper defaults.
			textInputProps={{
				outlineColor: theme.colors.outline,
				activeOutlineColor: theme.colors.primary,
				left: renderLeadingElement ? (
					<TextInput.Icon
						icon={() => renderLeadingElement(selectedForDisplay, true)}
					/>
				) : undefined,
			}}
			renderItem={
				renderLeadingElement
					? ({item, isSelected, onPress}) => {
							const element = elements.find(
								(candidate) => candidate.id.toString() === item._id,
							);
							if (!element) {
								return null;
							}
							return (
								<Pressable
									style={styles.option}
									onPress={onPress}
									accessibilityRole="button"
									accessibilityState={{selected: isSelected}}>
									{/* Selection indicator on the left, matching the
									    default Checkbox.Item (position="leading").
									    The slot is always reserved (the check is only
									    hidden when unselected) so that every item keeps
									    the same padding and stays aligned, exactly like
									    the OptionSelector. */}
									<View
										style={[
											styles.checkboxContainer,
											isSelected ? styles.checkVisible : styles.checkHidden,
										]}>
										<Icon
											source="check"
											size={20}
											color={theme.colors.primary}
										/>
									</View>
									{renderLeadingElement(element, isSelected)}
									<Text variant="bodyMedium" style={styles.optionLabel}>
										{item.value}
									</Text>
								</Pressable>
							);
						}
					: undefined
			}
		/>
	);
}
