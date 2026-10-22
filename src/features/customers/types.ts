export type Customer = {
	id: number;
	name: string;
	number: string;
	comment: string | null;
	country: string;
	language: string;
	visible: boolean;
	billable: boolean;
	currency: string;
	company?: string;
	street?: string;
	zipcode?: string;
	city?: string;
	timezone?: string;
	metaFields: Array<unknown>;
	teams: Array<unknown>;
	color: string | null;
	// Invoice settings (Kimai customer invoice fields)
	vatId?: string;
	invoiceEmail?: string;
	buyerReference?: string;
	invoiceTemplate?: string;
	invoiceText?: string;
};

export type CustomersState = {
	customers: {[id: number]: Customer};
	selectedCustomerId: number | undefined;
};
