import React from 'react';

import {BaseScreen} from 'src/ui/BaseScreen';
import {Customer} from '../types';
import {DividedList} from 'src/ui/DividedList';
import {ListItem} from 'src/ui/ListItem';
import {ListItemText} from 'src/ui/ListItemText';
import {selectCustomerList} from '../context/customersSelectors';
import {useAppSelector} from 'src/features/data/context/store';

const CustomerItem = ({customer}: {customer: Customer}) => {
	return (
		<ListItem>
			<ListItemText>{customer.name}</ListItemText>
		</ListItem>
	);
};

const CustomerList = () => {
	const customerList = useAppSelector(selectCustomerList);

	return (
		<DividedList
			data={customerList}
			renderItem={({item}) => <CustomerItem customer={item} />}
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
