export type TimesheetFromApi = {
	id: number;
	activity: number;
	project: number;
	user: number;
	tags: Array<unknown>;
	begin: string;
	end: string | null;
	duration: number;
	description: null;
	rate: number;
	internalRate: number;
	exported: boolean;
	billable: boolean;
	metaFields: Array<unknown>;
};

export type Timesheet = Partial<Omit<TimesheetFromApi, 'id'>> & {
	id: string;
};

export type TimesheetsState = {
	timesheets: {[id: string]: Timesheet};
	timesheetIdTable: {[id: string]: number};
};
