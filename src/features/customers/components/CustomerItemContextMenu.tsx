import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {useAppDispatch} from 'src/features/data/context/store';
import {EntityItemContextMenu} from 'src/ui/EntityItemContextMenu';
import {removeCustomer} from '../middleware/customersThunks';
import {Customer} from '../types';
import {EditCustomerModal} from './EditCustomerModal';

type CustomerItemContextMenuProps = {
	customer: Customer;
	visible: boolean;
	onHideMenu: () => void;
};

export const CustomerItemContextMenu = ({
	customer,
	visible,
	onHideMenu,
}: CustomerItemContextMenuProps) => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const [editModalVisible, setEditModalVisible] = useState(false);

	const onConfirmDelete = useCallback(() => {
		dispatch(removeCustomer(customer.id)).catch(console.error);
	}, [customer.id, dispatch]);

	const onEditPressed = useCallback(() => {
		setEditModalVisible(true);
	}, []);

	const onHideEditModal = useCallback(() => setEditModalVisible(false), []);

	return (
		<>
			<EditCustomerModal
				customer={customer}
				visible={editModalVisible}
				onHideModal={onHideEditModal}
			/>
			<EntityItemContextMenu
				visible={visible}
				onHideMenu={onHideMenu}
				title={customer.name}
				deleteTitle={t('deleteCustomer')}
				deleteWarning={t('deleteCustomerWarning')}
				onConfirmDelete={onConfirmDelete}
				onEdit={onEditPressed}
			/>
		</>
	);
};
