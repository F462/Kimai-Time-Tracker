/**
 * A known NFC tag that the user has registered and optionally configured
 * with a specific project and activity to start/stop.
 */
export type NfcTag = {
	/** The unique NFC tag identifier (UID). */
	id: string;
	/** A user-friendly name for the tag (e.g. "Office desk"). */
	name: string;
	/** The project to use when this tag is scanned. */
	projectId?: number;
	/** The activity to use when this tag is scanned. */
	activityId?: number;
};

export type NfcState = {
	/** Known NFC tags, keyed by their UID. */
	tags: Record<string, NfcTag>;
	/** Whether the app is waiting for a new NFC tag to be scanned. */
	isScanning: boolean;
};
