import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Pressable, StyleSheet, View} from 'react-native';
import {Icon, Text, useTheme} from 'react-native-paper';

import {ColorPicker} from 'src/ui/ColorPicker';
import {CUSTOMER_COLORS} from '../utils/options';

type CustomerColorFieldProps = {
	value: string | null;
	onChange: (value: string | null) => void;
};

const styles = StyleSheet.create({
	label: {
		marginBottom: 8,
	},
	row: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
	},
	swatch: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	noneLine: {
		width: 24,
		height: 2,
		borderRadius: 1,
		transform: [{rotate: '45deg'}],
	},
	customRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		padding: 10,
		borderRadius: 12,
		borderWidth: 1,
		marginTop: 12,
	},
	customDot: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},
	customLabel: {
		flex: 1,
	},
	customHex: {
		opacity: 0.7,
	},
});

/**
 * A color picker for a customer's color field.
 *
 * Tapping a palette swatch (or the "none" swatch) sets the color directly,
 * while the "Custom color" row opens a full HSL color picker so any color can
 * be chosen.
 */
export function CustomerColorField({value, onChange}: CustomerColorFieldProps) {
	const theme = useTheme();
	const {t} = useTranslation();
	const [pickerVisible, setPickerVisible] = useState(false);

	const backgroundStyle = (color: string) => ({backgroundColor: color});

	const selectionBorder = (isSelected: boolean) => ({
		borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
		borderWidth: isSelected ? 2 : 1,
	});

	const normalizedValue = value !== null ? value.toLowerCase() : null;
	// True when the active color is not part of the quick-pick palette, i.e.
	// it was created with the custom color picker.
	const isCustomSelection =
		normalizedValue !== null &&
		!CUSTOMER_COLORS.some((color) => color.toLowerCase() === normalizedValue);

	const openPicker = (): void => setPickerVisible(true);

	const confirmCustomColor = (hex: string): void => {
		onChange(hex);
		setPickerVisible(false);
	};

	return (
		<View>
			<Text variant="labelMedium" style={styles.label}>
				{t('color')}
			</Text>
			<View style={styles.row}>
				<Pressable
					onPress={() => onChange(null)}
					accessibilityLabel={t('noColor')}
					style={[
						styles.swatch,
						backgroundStyle(theme.colors.surface),
						selectionBorder(value === null),
					]}>
					<View
						style={[styles.noneLine, backgroundStyle(theme.colors.outline)]}
					/>
				</Pressable>
				{CUSTOMER_COLORS.map((color) => (
					<Pressable
						key={color}
						onPress={() => onChange(color)}
						accessibilityLabel={color}
						style={[
							styles.swatch,
							backgroundStyle(color),
							selectionBorder(normalizedValue === color.toLowerCase()),
						]}
					/>
				))}
			</View>
			<Pressable
				onPress={openPicker}
				accessibilityLabel={t('customColor')}
				style={[
					styles.customRow,
					{
						backgroundColor: theme.colors.surface,
						borderColor: isCustomSelection
							? theme.colors.primary
							: theme.colors.outline,
					},
				]}>
				<View
					style={[
						styles.customDot,
						value !== null
							? backgroundStyle(value)
							: backgroundStyle(theme.colors.background),
					]}>
					{value !== null ? (
						<Icon source="check" size={16} color="#ffffff" />
					) : (
						<Icon source="palette" size={18} color={theme.colors.outline} />
					)}
				</View>
				<Text variant="bodyMedium" style={styles.customLabel}>
					{t('customColor')}
				</Text>
				{value !== null && (
					<Text
						variant="bodySmall"
						style={[styles.customHex, {color: theme.colors.onSurfaceVariant}]}>
						{value}
					</Text>
				)}
			</Pressable>
			<ColorPicker
				visible={pickerVisible}
				initialColor={value}
				onConfirm={confirmCustomColor}
				onDismiss={() => setPickerVisible(false)}
			/>
		</View>
	);
}
