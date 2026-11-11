import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {FAB, Text, useTheme} from 'react-native-paper';

import {selectActivity} from 'src/features/activities/context/activitiesSelectors';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {selectProject} from 'src/features/projects/context/projectsSelectors';
import {useResponsiveScale} from 'src/features/theming/utils/useResponsiveScale';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {BaseScreen} from 'src/ui/BaseScreen';
import {ColorIndicator} from 'src/ui/ColorIndicator';
import {DividedList} from 'src/ui/DividedList';
import {ListItem} from 'src/ui/ListItem';
import {selectIsNfcScanning, selectNfcTagList} from '../context/nfcSelectors';
import {nfcScanningStarted, nfcScanningStopped} from '../context/nfcSlice';
import type {NfcTag} from '../types';
import {NfcTagItemContextMenu} from './NfcTagItemContextMenu';

const styles = StyleSheet.create({
	fab: {
		position: 'absolute',
		right: 20,
		bottom: 20,
	},
	cardRow: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 12,
	},
	flex: {
		flex: 1,
	},
	detailsContainer: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 4,
	},
	detailsText: {
		fontWeight: '500',
	},
	detailField: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 5,
	},
	empty: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 40,
		gap: 8,
	},
	banner: {
		marginHorizontal: 2,
		marginBottom: 8,
	},
	card: {
		borderRadius: 14,
		borderWidth: 1,
		flexDirection: 'column',
		gap: 6,
		marginHorizontal: 12,
		marginVertical: 6,
		padding: 14,
	},
});

/**
 * Base (unscaled) metrics of the react-native-paper MD3 text variants used in
 * this file. They are multiplied by the responsive scale so the card looks
 * proportionally consistent across devices with different logical screen
 * sizes.
 */
const TEXT_VARIANTS = {
	titleMedium: {fontSize: 16, lineHeight: 24},
	bodyMedium: {fontSize: 14, lineHeight: 20},
	labelSmall: {fontSize: 11, lineHeight: 16},
} as const;

const scaledTextStyle = (
	scale: number,
	variant: keyof typeof TEXT_VARIANTS,
): {fontSize: number; lineHeight: number} => ({
	fontSize: TEXT_VARIANTS[variant].fontSize * scale,
	lineHeight: TEXT_VARIANTS[variant].lineHeight * scale,
});

const NfcTagItem = ({tag}: {tag: NfcTag}) => {
	const {t} = useTranslation();
	const theme = useTheme();
	const [contextMenuVisible, setContextMenuVisible] = useState(false);
	const project = useAppSelector(selectProject(tag.projectId));
	const activity = useAppSelector(selectActivity(tag.activityId));
	const scale = useResponsiveScale();

	const onOpenContextMenu = useCallback(() => setContextMenuVisible(true), []);
	const onHideContextMenu = useCallback(() => setContextMenuVisible(false), []);

	const dynamicStyles = useStyle(
		() => ({
			card: {
				backgroundColor: theme.colors.surface,
				borderColor: theme.colors.outlineVariant,
				borderRadius: 14 * scale,
				gap: 6 * scale,
				marginHorizontal: 12 * scale,
				marginVertical: 6 * scale,
				padding: 14 * scale,
			},
			cardRow: {gap: 12 * scale},
			detailsContainer: {
				gap: 4 * scale,
			},
			detailField: {gap: 5 * scale},
			mutedText: {color: theme.colors.onSurfaceVariant},
		}),
		[
			scale,
			theme.colors.onSurfaceVariant,
			theme.colors.outlineVariant,
			theme.colors.surface,
		],
	);

	const detailsTextStyle = scaledTextStyle(scale, 'bodyMedium');
	const indicatorSize = 18 * scale;

	return (
		<>
			<ListItem
				onLongPress={onOpenContextMenu}
				style={[styles.card, dynamicStyles.card]}>
				<View style={[styles.cardRow, dynamicStyles.cardRow]}>
					<Text
						variant="titleMedium"
						numberOfLines={1}
						style={[styles.flex, scaledTextStyle(scale, 'titleMedium')]}>
						{tag.name}
					</Text>
					<Text
						variant="labelSmall"
						numberOfLines={1}
						style={[
							scaledTextStyle(scale, 'labelSmall'),
							dynamicStyles.mutedText,
						]}>
						{tag.id}
					</Text>
				</View>
				<View style={[styles.detailsContainer, dynamicStyles.detailsContainer]}>
					{!project && !activity ? (
						<Text style={[detailsTextStyle, dynamicStyles.mutedText]}>
							{t('nfc.followSelection')}
						</Text>
					) : (
						<>
							{project ? (
								<View style={[styles.detailField, dynamicStyles.detailField]}>
									<Text style={[styles.detailsText, detailsTextStyle]}>
										{project.name}
									</Text>
									<ColorIndicator color={project.color} size={indicatorSize} />
								</View>
							) : (
								<Text style={[detailsTextStyle, dynamicStyles.mutedText]}>
									{t('nfc.followSelection')}
								</Text>
							)}
							<Text style={detailsTextStyle}> · </Text>
							{activity ? (
								<View style={[styles.detailField, dynamicStyles.detailField]}>
									<ColorIndicator color={activity.color} size={indicatorSize} />
									<Text style={[styles.detailsText, detailsTextStyle]}>
										{activity.name}
									</Text>
								</View>
							) : (
								<Text style={[detailsTextStyle, dynamicStyles.mutedText]}>
									{t('nfc.followSelection')}
								</Text>
							)}
						</>
					)}
				</View>
			</ListItem>
			<NfcTagItemContextMenu
				tag={tag}
				visible={contextMenuVisible}
				onHideMenu={onHideContextMenu}
			/>
		</>
	);
};

/**
 * Screen for managing known NFC tags.
 *
 * Each tag can be assigned a display name and an optional project and
 * activity. Scanning a tag that has no configured project/activity falls
 * back to the currently selected ones. A tag can be registered by pressing
 * the "Scan" button and then tapping the physical NFC tag; the global
 * {@link NfcIntegration} component picks the tag up while scanning mode is
 * active and registers it.
 */
export const NfcTagsScreen = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const tags = useAppSelector(selectNfcTagList);
	const isScanning = useAppSelector(selectIsNfcScanning);
	const dynamicStyles = useStyle(
		() => ({
			helpText: {color: theme.colors.onSurfaceVariant},
			banner: {backgroundColor: theme.colors.primaryContainer},
		}),
		[theme.colors.onSurfaceVariant, theme.colors.primaryContainer],
	);

	const onScan = useCallback(() => {
		if (isScanning) {
			dispatch(nfcScanningStopped());
		} else {
			dispatch(nfcScanningStarted());
		}
	}, [dispatch, isScanning]);

	if (tags.length === 0 && !isScanning) {
		return (
			<BaseScreen>
				<View style={styles.empty}>
					<Text style={dynamicStyles.helpText}>{t('nfc.noTags')}</Text>
					<Text variant="bodySmall" style={dynamicStyles.helpText}>
						{t('nfc.noTagsHint')}
					</Text>
				</View>
				<FAB
					icon="nfc-variant"
					label={t('nfc.scan')}
					onPress={onScan}
					style={styles.fab}
				/>
			</BaseScreen>
		);
	}

	return (
		<BaseScreen>
			{isScanning ? (
				<View style={[styles.banner, dynamicStyles.banner]}>
					<Text variant="bodyMedium">{t('nfc.scanning')}</Text>
				</View>
			) : null}
			<DividedList
				data={tags}
				showDividers={false}
				renderItem={({item}) => <NfcTagItem tag={item} />}
			/>
			<FAB
				icon={isScanning ? 'stop' : 'nfc-variant'}
				label={isScanning ? t('cancel') : t('nfc.scan')}
				onPress={onScan}
				style={styles.fab}
			/>
		</BaseScreen>
	);
};
