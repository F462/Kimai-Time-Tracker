import React from 'react';

import {ListItem} from './ListItem';
import {ListItemText} from './ListItemText';

export type EntityListItemProps = {
	name: string;
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
	isSelected,
	onPress,
	onLongPress,
	contextMenu,
}: EntityListItemProps) => {
	return (
		<>
			{contextMenu}
			<ListItem
				isSelected={isSelected}
				onPress={onPress}
				onLongPress={onLongPress}>
				<ListItemText>{name}</ListItemText>
			</ListItem>
		</>
	);
};
