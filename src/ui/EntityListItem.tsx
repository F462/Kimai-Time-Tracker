import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from 'react-native-paper';

import {ColorIndicator} from './ColorIndicator';
import {ListItem} from './ListItem';
import {ListItemText} from './ListItemText';

const styles = StyleSheet.create({
	content: {
		alignItems: 'center',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 12,
	},
	itemText: {
		flex: 1,
		fontWeight: '600',
	},
	card: {
		borderRadius: 14,
		borderWidth: 1,
		marginHorizontal: 12,
		marginVertical: 6,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	colorIndicator: {
		marginLeft: 8,
	},
});

export type EntityListItemProps = {
	name: string;
	color?: string | null;
	isSelected?: boolean;
	onPress?: () => void;
	/**
	 * Handler for a long press of the item, e.g. to open a context menu. The
	 * item only responds to long press when this is provided.
	 */
	onLongPress?: () => void;
	/**
	 * Optional content rendered alongside the item, e.g. a context menu. The
	 * caller is responsible for the menu's own visibility and dismissal.
	 */
	contextMenu?: React.ReactNode;
};

/**
 * A unified list item for entity lists (activities, customers, projects, …).
 *
 * It renders the shared {@link ListItem}/{@link ListItemText} UI and supports
 * selection, press, and an optional long-press context menu. Keeping this in
 * one place means features added later (e.g. a context menu) benefit every
 * entity list uniformly.
 */
export const EntityListItem = ({
	name,
	color,
	isSelected,
	onPress,
	onLongPress,
	contextMenu,
}: EntityListItemProps) => {
	const theme = useTheme();

	return (
		<>
			{contextMenu}
			<ListItem
				isSelected={isSelected}
				onPress={onPress}
				onLongPress={onLongPress}
				style={[
					styles.card,
					{
						backgroundColor: isSelected
							? theme.colors.primaryContainer
							: theme.colors.surface,
						borderColor: isSelected
							? theme.colors.primary
							: theme.colors.outlineVariant,
					},
				]}>
				<View style={styles.content}>
					<ListItemText style={styles.itemText}>{name}</ListItemText>
					{color ? (
						<ColorIndicator
							color={color}
							style={styles.colorIndicator}
							testID="entity-list-item-indicator"
						/>
					) : null}
				</View>
			</ListItem>
		</>
	);
};
