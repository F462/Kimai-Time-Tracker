import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {useTheme} from 'react-native-paper';

import {BaseSelector} from 'src/ui/Selectors/BaseSelector';

type CustomerColorFieldProps = {
	value: string | null;
	colors: Record<string, string>;
	onChange: (value: string | null) => void;
};

const NO_COLOR_ID = '__no_color__';

const styles = StyleSheet.create({
	swatch: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	noneLine: {
		width: 24,
		height: 2,
		borderRadius: 1,
		transform: [{rotate: '45deg'}],
	},
});

export function CustomerColorField({
	value,
	colors,
	onChange,
}: CustomerColorFieldProps) {
	const theme = useTheme();
	const {t} = useTranslation();

	const elements = [
		{id: NO_COLOR_ID, name: t('noColor')},
		...Object.keys(colors).map((name) => ({id: name, name})),
	];

	const selectedColorName = Object.entries(colors).find(
		([, color]) =>
			value !== null && color.toLowerCase() === value.toLowerCase(),
	)?.[0];

	const selectedElement =
		elements.find(
			(element) => element.id === (selectedColorName ?? NO_COLOR_ID),
		) ?? elements[0];

	const renderSwatch = (element: {id: string; name: string}) => {
		const color = element.id === NO_COLOR_ID ? undefined : colors[element.id];
		return (
			<View
				style={[
					styles.swatch,
					{
						backgroundColor: color ?? theme.colors.surface,
						borderColor: theme.colors.outline,
					},
				]}>
				{color === undefined && (
					<View
						style={[styles.noneLine, {backgroundColor: theme.colors.outline}]}
					/>
				)}
			</View>
		);
	};

	return (
		<BaseSelector
			elements={elements}
			selectedElement={selectedElement}
			label={t('color')}
			onSelection={(selection) => {
				const selected = selection.selectedList[0];
				if (!selected || selected._id === NO_COLOR_ID) {
					onChange(null);
					return;
				}
				onChange(colors[selected._id] ?? null);
			}}
			renderLeadingElement={renderSwatch}
		/>
	);
}
