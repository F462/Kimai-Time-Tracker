import React, {useCallback} from 'react';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {BaseScreen} from 'src/ui/BaseScreen';
import {DividedList} from 'src/ui/DividedList';
import {EntityListItem} from 'src/ui/EntityListItem';
import {
	selectCustomerList,
	selectSelectedCustomerId,
} from '../context/customersSelectors';
import {customerSelected} from '../context/customersSlice';
import {Customer} from '../types';

const CustomerItem = ({
	customer,
	isSelected,
}: {
	customer: Customer;
	isSelected: boolean;
}) => {
	const dispatch = useAppDispatch();

	const onSelectCustomer = useCallback(() => {
		dispatch(customerSelected(customer.id));
	}, [dispatch, customer.id]);

	return (
		<EntityListItem
			name={customer.name}
			isSelected={isSelected}
			onPress={onSelectCustomer}
		/>
	);
};

const CustomerList = () => {
	const customerList = useAppSelector(selectCustomerList);
	const selectedCustomerId = useAppSelector(selectSelectedCustomerId);

	return (
		<DividedList
			data={customerList}
			renderItem={({item}) => (
				<CustomerItem
					customer={item}
					isSelected={item.id === selectedCustomerId}
				/>
			)}
		/>
	);
};

export const CustomersScreen = () => {
	return (
		<BaseScreen>
			<CustomerList />
		</BaseScreen>
	);
};
