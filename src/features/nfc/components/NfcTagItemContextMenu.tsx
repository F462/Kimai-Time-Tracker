import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {useAppDispatch} from 'src/features/data/context/store';
import {EntityItemContextMenu} from 'src/ui/EntityItemContextMenu';
import {nfcReprogrammingStarted, nfcTagRemoved} from '../context/nfcSlice';
import type {NfcTag} from '../types';
import {NfcTagModal} from './NfcTagModal';

type NfcTagItemContextMenuProps = {
	tag: NfcTag;
	visible: boolean;
	onHideMenu: () => void;
};

export const NfcTagItemContextMenu = ({
	tag,
	visible,
	onHideMenu,
}: NfcTagItemContextMenuProps) => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const [editModalVisible, setEditModalVisible] = useState(false);

	const onConfirmDelete = useCallback(() => {
		dispatch(nfcTagRemoved(tag.id));
	}, [dispatch, tag.id]);

	const onEditPressed = useCallback(() => {
		setEditModalVisible(true);
	}, []);

	const onReprogramPressed = useCallback(() => {
		dispatch(nfcReprogrammingStarted(tag.id));
	}, [dispatch, tag.id]);

	const onHideEditModal = useCallback(() => setEditModalVisible(false), []);

	return (
		<>
			<NfcTagModal
				tag={tag}
				visible={editModalVisible}
				onHideModal={onHideEditModal}
			/>
			<EntityItemContextMenu
				visible={visible}
				onHideMenu={onHideMenu}
				title={tag.name}
				actionTitle={t('nfc.reprogramTag')}
				actionIcon="refresh"
				onAction={onReprogramPressed}
				deleteTitle={t('nfc.deleteTag')}
				deleteWarning={t('nfc.deleteTagWarning')}
				onConfirmDelete={onConfirmDelete}
				onEdit={onEditPressed}
			/>
		</>
	);
};
