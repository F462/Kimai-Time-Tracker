export type Timesheet = {
	activity: number;
	project: number;
	user: number;
	tags: Array<unknown>;
	id: number;
	begin: string;
	end: string;
	duration: number;
	description: null;
	rate: number;
	internalRate: number;
	exported: boolean;
	billable: boolean;
	metaFields: Array<unknown>;
};

export type TimesheetsState = {
	timesheetList: Array<Timesheet>;
};
