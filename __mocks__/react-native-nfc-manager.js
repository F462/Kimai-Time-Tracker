class NfcErrorBase extends Error {}
class UnsupportedFeature extends NfcErrorBase {}
class RadioDisabled extends NfcErrorBase {}
class UserCancel extends NfcErrorBase {}

const NfcError = {
	NfcErrorBase,
	UnsupportedFeature,
	RadioDisabled,
	UserCancel,
};

const NfcTech = {
	Ndef: 'Ndef',
	NfcA: 'NfcA',
	NfcB: 'NfcB',
	NfcF: 'NfcF',
	NfcV: 'NfcV',
	IsoDep: 'IsoDep',
};

const NfcEvents = {
	DiscoverTag: 'NfcManagerDiscoverTag',
	DiscoverBackgroundTag: 'NfcManagerDiscoverBackgroundTag',
	SessionClosed: 'NfcManagerSessionClosed',
	StateChanged: 'NfcManagerStateChanged',
};

const NfcManager = {
	isSupported: jest.fn(() => Promise.resolve(true)),
	isEnabled: jest.fn(() => Promise.resolve(true)),
	start: jest.fn(() => Promise.resolve()),
	requestTechnology: jest.fn(() => Promise.resolve(NfcTech.Ndef)),
	cancelTechnologyRequest: jest.fn(() => Promise.resolve()),
	getTag: jest.fn(() =>
		Promise.resolve({
			id: 'MOCK-UID',
			techList: ['Ndef'],
			ndefMessage: null,
		}),
	),
	setAlertMessage: jest.fn(() => Promise.resolve()),
	stop: jest.fn(() => Promise.resolve()),
	registerTagEvent: jest.fn(() => Promise.resolve()),
	unregisterTagEvent: jest.fn(() => Promise.resolve()),
	setEventListener: jest.fn(),
	getBackgroundTag: jest.fn(() => Promise.resolve(null)),
	clearBackgroundTag: jest.fn(() => Promise.resolve()),
	writeNdefMessage: jest.fn(() => Promise.resolve()),
	getNdefMessage: jest.fn(() => Promise.resolve(null)),
	getNdefStatus: jest.fn(() =>
		Promise.resolve({status: 2, capacity: 160}),
	),
};

const Ndef = {
	mimeMediaRecord: jest.fn((mimeType, payload) => ({
		tnf: 4,
		type: mimeType,
		id: [],
		payload: payload || [],
	})),
	encodeMessage: jest.fn((records) => records || []),
};

export {Ndef, NfcError, NfcEvents, NfcTech};
export default NfcManager;
