import {type ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
	type GestureResponderEvent,
	PanResponder,
	type PanResponderInstance,
	StyleSheet,
	View,
} from 'react-native';
import {
	Button,
	IconButton,
	Modal,
	Portal,
	Text,
	useTheme,
} from 'react-native-paper';

import {useStyle} from 'src/features/theming/utils/useStyle';
import {hexToHsl, hslToHex} from './color';

const THUMB_SIZE = 24;
/** Rainbow approximation used to paint the hue track. */
const HUE_STOPS = [
	'#ff0000',
	'#ffff00',
	'#00ff00',
	'#00ffff',
	'#0000ff',
	'#ff00ff',
];

type ColorSliderProps = {
	label: string;
	value: number;
	min: number;
	max: number;
	step?: number;
	onValueChange: (value: number) => void;
	/** Optional custom track background (e.g. the rainbow for the hue slider). */
	trackRender?: () => ReactNode;
	/** Color of the thumb. Defaults to the theme primary color. */
	thumbColor?: string;
};

const sliderStyles = StyleSheet.create({
	container: {
		marginVertical: 8,
	},
	labelRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'baseline',
		marginBottom: 6,
	},
	labelValue: {
		opacity: 0.7,
	},
	trackContainer: {
		height: THUMB_SIZE,
		borderRadius: THUMB_SIZE / 2,
		overflow: 'hidden',
	},
	hueTrackRow: {
		flexDirection: 'row',
		height: THUMB_SIZE,
	},
	hueSegment: {
		flex: 1,
	},
	thumb: {
		position: 'absolute',
		top: 0,
		width: THUMB_SIZE,
		height: THUMB_SIZE,
		borderRadius: THUMB_SIZE / 2,
		borderWidth: 2,
	},
});

/**
 * A lightweight, dependency-free slider. Because the installed
 * `react-native-paper` (v5) and this `react-native` version expose no slider
 * component, this one is built on top of `PanResponder`. It supports both
 * tap-to-set and drag-to-scrub, and stays accessible via the `adjustable`
 * role.
 */
function ColorSlider({
	label,
	value,
	min,
	max,
	step = 1,
	onValueChange,
	trackRender,
	thumbColor,
}: ColorSliderProps) {
	const theme = useTheme();
	const [trackWidth, setTrackWidth] = useState(0);
	const trackWidthRef = useRef(0);
	const onValueChangeRef = useRef(onValueChange);
	onValueChangeRef.current = onValueChange;

	const clampedRatio = Math.max(0, Math.min(1, (value - min) / (max - min)));

	const setTrackWidthBoth = (width: number): void => {
		trackWidthRef.current = width;
		setTrackWidth(width);
	};

	const updateFromLocationX = (locationX: number): void => {
		if (trackWidthRef.current <= 0) {
			return;
		}
		const clamped = Math.max(0, Math.min(trackWidthRef.current, locationX));
		const raw = min + (clamped / trackWidthRef.current) * (max - min);
		const stepped = Math.round(raw / step) * step;
		onValueChangeRef.current(Math.max(min, Math.min(max, stepped)));
	};

	const panResponder: PanResponderInstance = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onMoveShouldSetPanResponder: () => true,
				onPanResponderRelease: () => true,
				onPanResponderTerminationRequest: () => true,
				onPanResponderGrant: (event: GestureResponderEvent) => {
					updateFromLocationX(event.nativeEvent.locationX);
				},
				onPanResponderMove: (event: GestureResponderEvent) => {
					updateFromLocationX(event.nativeEvent.locationX);
				},
			}),
		// The responder only reads its dependencies through refs, so it can be
		// stable across renders and not interrupt an in-progress drag.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[min, max, step],
	);

	return (
		<View style={sliderStyles.container}>
			<View style={sliderStyles.labelRow}>
				<Text variant="labelMedium">{label}</Text>
				<Text variant="labelSmall" style={sliderStyles.labelValue}>
					{Math.round(value)}
				</Text>
			</View>
			<View
				style={[
					sliderStyles.trackContainer,
					{backgroundColor: theme.colors.outlineVariant},
				]}
				onLayout={(event) => setTrackWidthBoth(event.nativeEvent.layout.width)}
				{...panResponder.panHandlers}
				accessibilityRole="adjustable"
				accessibilityLabel={label}
				accessibilityValue={{min, max, now: Math.round(value)}}
				accessibilityHint="Double tap and drag to adjust">
				{trackRender ? (
					trackRender()
				) : (
					<View style={sliderStyles.hueTrackRow} />
				)}
				<View
					style={[
						sliderStyles.thumb,
						{
							backgroundColor: thumbColor ?? theme.colors.primary,
							borderColor: theme.colors.surface,
							left: clampedRatio * Math.max(0, trackWidth - THUMB_SIZE),
						},
					]}
				/>
			</View>
		</View>
	);
}

type ColorPickerProps = {
	visible: boolean;
	/** The color to start from. When null, a sensible default is used. */
	initialColor: string | null;
	onConfirm: (hex: string) => void;
	onDismiss: () => void;
};

const styles = StyleSheet.create({
	modal: {
		padding: 20,
		margin: 16,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	preview: {
		height: 72,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 4,
	},
	previewLabel: {
		marginBottom: 8,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 12,
		gap: 12,
	},
});

/**
 * A modal HSL color picker. It renders three sliders (hue, saturation and
 * lightness) with a live preview and confirms with a hex color.
 */
export function ColorPicker({
	visible,
	initialColor,
	onConfirm,
	onDismiss,
}: ColorPickerProps) {
	const theme = useTheme();
	const {t} = useTranslation();

	const [h, setH] = useState(210);
	const [s, setS] = useState(100);
	const [l, setL] = useState(50);

	useEffect(() => {
		if (!visible) {
			return;
		}
		const {h: ih, s: is, l: il} = hexToHsl(initialColor ?? '#3498db');
		setH(ih);
		setS(is);
		setL(il);
	}, [visible, initialColor]);

	const previewColor = hslToHex(h, s, l);

	const dynamicStyles = useStyle(
		() => ({
			modal: {
				backgroundColor: theme.colors.background,
			},
			preview: {
				backgroundColor: previewColor,
				borderColor: theme.colors.outlineVariant,
			},
			previewLabel: {
				color: theme.colors.onSurfaceVariant,
			},
		}),
		[
			theme.colors.background,
			theme.colors.outlineVariant,
			theme.colors.onSurfaceVariant,
			previewColor,
		],
	);

	const renderHueTrack = (): ReactNode => (
		<View style={sliderStyles.hueTrackRow}>
			{HUE_STOPS.map((color, index) => (
				<View
					key={index}
					style={[sliderStyles.hueSegment, {backgroundColor: color}]}
				/>
			))}
		</View>
	);

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onDismiss}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<View style={styles.header}>
					<Text variant="titleLarge">{t('chooseColor')}</Text>
					<IconButton icon="close" onPress={onDismiss} />
				</View>

				<View style={[styles.preview, dynamicStyles.preview]} />
				<Text
					variant="labelMedium"
					style={[styles.previewLabel, dynamicStyles.previewLabel]}>
					{previewColor}
				</Text>

				<ColorSlider
					label={t('hue')}
					value={h}
					min={0}
					max={360}
					step={1}
					onValueChange={setH}
					trackRender={renderHueTrack}
					thumbColor={previewColor}
				/>
				<ColorSlider
					label={t('saturation')}
					value={s}
					min={0}
					max={100}
					step={1}
					onValueChange={setS}
					thumbColor={previewColor}
				/>
				<ColorSlider
					label={t('lightness')}
					value={l}
					min={0}
					max={100}
					step={1}
					onValueChange={setL}
					thumbColor={previewColor}
				/>

				<View style={styles.buttonContainer}>
					<Button onPress={onDismiss}>{t('dismiss')}</Button>
					<Button mode="contained" onPress={() => onConfirm(previewColor)}>
						{t('save')}
					</Button>
				</View>
			</Modal>
		</Portal>
	);
}
