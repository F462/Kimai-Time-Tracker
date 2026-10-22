export type Project = {
	parentTitle: string;
	customer: number;
	id: number;
	name: string;
	/** Project start date (times before this date cannot be recorded), `YYYY-MM-DD` or null. */
	start: string | null;
	/** Project end date (times after this date cannot be recorded), `YYYY-MM-DD` or null. */
	end: string | null;
	/** Timesheets up to and including this date are locked, `YYYY-MM-DD` or null. */
	lockedUntil: string | null;
	comment: string | null;
	visible: boolean;
	billable: boolean;
	/** Whether this project allows booking of global activities. */
	globalActivities: boolean;
	number: string;
	color: string | null;
	/** Monetary budget (permission-gated, may be missing). */
	budget?: number | null;
	/** Time budget in seconds (permission-gated, may be missing). */
	timeBudget?: number | null;
	/** `month` for a monthly budget, null for the default life-cycle budget. */
	budgetType?: string | null;
	/** Order number shown on invoices. */
	orderNumber?: string | null;
	/** Order date, `YYYY-MM-DD` or null. */
	orderDate?: string | null;
	/** Text used in invoice documents (not returned by the API). */
	invoiceText?: string | null;
	metaFields: Array<unknown>;
	teams: Array<unknown>;
};

export type ProjectsState = {
	projects: {[id: number]: Project};
	selectedProjectId: number | undefined;
};
