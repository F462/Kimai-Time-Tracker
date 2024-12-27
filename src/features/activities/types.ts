export type Activity = {
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

export type ActivitiesState = {
	activities: {[id: number]: Activity};
	selectedActivityId: number | undefined;
};
