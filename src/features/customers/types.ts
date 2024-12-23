export type Customer = {
	id: number;
	name: string;
	number: string;
	comment: string | null;
	visible: boolean;
	billable: boolean;
	currency: string;
	metaFields: Array<unknown>;
	teams: Array<unknown>;
	color: string | null;
};

export type CustomersState = {
	customerList: Array<Customer>;
};
