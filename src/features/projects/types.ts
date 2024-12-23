export type Project = {
	parentTitle: string;
	customer: number;
	id: number;
	name: string;
	start: null;
	end: null;
	comment: string | null;
	visible: boolean;
	billable: boolean;
	metaFields: Array<unknown>;
	teams: Array<unknown>;
	globalActivities: boolean;
	number: string;
	color: string | null;
};

export type ProjectsState = {
	projects: {[id: number]: Project};
};
