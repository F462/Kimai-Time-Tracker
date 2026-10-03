import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';

import {useAppDispatch} from 'src/features/data/context/store';
import {EntityItemContextMenu} from 'src/ui/EntityItemContextMenu';
import {removeCustomer} from '../middleware/customersThunks';
import {Customer} from '../types';

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

	const onConfirmDelete = useCallback(() => {
		dispatch(removeCustomer(customer.id)).catch(console.error);
	}, [customer.id, dispatch]);

	return (
		<EntityItemContextMenu
			visible={visible}
			onHideMenu={onHideMenu}
			deleteTitle={t('deleteCustomer')}
			deleteWarning={t('deleteCustomerWarning')}
			onConfirmDelete={onConfirmDelete}
		/>
	);
};
