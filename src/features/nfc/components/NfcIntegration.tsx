import {useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, Platform} from 'react-native';
import NfcManager, {NfcEvents, TagEvent} from 'react-native-nfc-manager';

import {useAppDispatch} from 'src/features/data/context/store';
import {navigateToScreen} from 'src/features/navigation/context/navigationRef';
import {nfcTagDetected} from '../middleware/nfcThunks';

/**
 * `NfcManager.start()` re-parses the activity's launch intent on every call,
 * so without this guard a remount (e.g. a dev reload) would re-process the
 * tag that cold-started the app. Event-driven tags are always fresh and are
 * therefore unaffected.
 */
let consumedBackgroundTagId: string | undefined;

const isAndroid = Platform.OS === 'android';

const delay = (ms: number) =>
	new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});

/**
 * Headless integration component that reacts to NFC tag scans.
 *
 * Depending on the current app state it either:
 * - Registers the tag as a new known NFC tag (when scanning mode is active),
 * - Or, if the tag is already known, toggles the active timesheet using the
 *   tag's configured project and activity, falling back to the globally
 *   selected ones. Unknown tags cannot start or stop a timesheet.
 *
 * It works independently of any UI button:
 * - Android foreground: foreground dispatch fires `DiscoverTag`.
 * - Android background: the NFC intent re-activates the app and delivers the
 *   tag via `onNewIntent` (emitted as `DiscoverTag`).
 * - Android cold start: `start()` caches the launching tag; it is picked up
 *   via `getBackgroundTag()` (no event is emitted on cold start).
 * - iOS: background tags arrive through the user-activity bridge as
 *   `DiscoverBackgroundTag`.
 *
 * When a tag cannot start a timesheet (unknown tag, or no project or
 * activity resolved), the thunk rejects with an i18n key, which is surfaced
 * through an alert that guides the user to the NFC tags screen.
 */
export const NfcIntegration = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();

	const handleTag = useCallback(
		async (tagId: string | undefined) => {
			if (!tagId) {
				return;
			}

			const result = await dispatch(nfcTagDetected(tagId));
			if (nfcTagDetected.rejected.match(result)) {
				if (typeof result.payload === 'string') {
					Alert.alert(t('warning'), t(result.payload), [
						{
							text: t('nfc.goToScreen'),
							onPress: () => navigateToScreen('NfcTags'),
						},
					]);
				} else {
					// A dependent thunk threw instead of rejecting with an i18n
					// key; surface it in the logs rather than showing raw text.
					console.warn('nfcTagDetected rejected unexpectedly', result.payload);
				}
			}
		},
		[dispatch, t],
	);

	useEffect(() => {
		let disposed = false;

		// `setEventListener` expects a synchronous callback, so wrap the async
		// handler to keep the promise from floating.
		const onTag = (evt: TagEvent) => {
			if (evt.id) {
				// Tags delivered via `DiscoverBackgroundTag` are also cached
				// as the background tag; mark them consumed so a later `start()`
				// re-read of the launch intent does not process them twice.
				consumedBackgroundTagId = evt.id;
			}
			handleTag(evt.id).catch(console.warn);
		};

		const initialize = async () => {
			try {
				// `start()` can transiently fail while the activity is not yet
				// attached during a cold start; retry briefly before giving up.
				let started = false;
				for (let attempt = 1; attempt <= 3 && !started; attempt++) {
					if (disposed) {
						return;
					}
					try {
						await NfcManager.start();
						started = true;
					} catch (error) {
						if (attempt === 3) {
							throw error;
						}
						await delay(250);
					}
				}

				// Foreground dispatch registration is best-effort: even when it
				// fails, the cold-start tag below must still be processed.
				try {
					await NfcManager.registerTagEvent();
				} catch (error) {
					console.warn('NFC tag event registration failed', error);
				}

				// On Android `start()` caches the tag that launched the app
				// (cold start); it is not emitted as an event, so it has to be
				// read back explicitly. `getBackgroundTag` is not implemented
				// on iOS, where such tags arrive as `DiscoverBackgroundTag`.
				if (isAndroid) {
					const backgroundTag = await NfcManager.getBackgroundTag();
					const backgroundTagId = backgroundTag?.id;
					if (
						!disposed &&
						backgroundTagId &&
						backgroundTagId !== consumedBackgroundTagId
					) {
						onTag(backgroundTag);
					}
					await NfcManager.clearBackgroundTag();
				}
			} catch (error) {
				// The user can simply tap the tag again once NFC is available;
				// nothing to surface here.
				console.warn('NFC initialization failed', error);
			}
		};

		// Subscribe before initializing so that tags arriving while the native
		// side is still starting up are not lost.
		NfcManager.setEventListener(NfcEvents.DiscoverTag, onTag);
		NfcManager.setEventListener(NfcEvents.DiscoverBackgroundTag, onTag);

		initialize().catch(console.warn);

		return () => {
			disposed = true;
			NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
			NfcManager.setEventListener(NfcEvents.DiscoverBackgroundTag, null);
			NfcManager.unregisterTagEvent().catch(console.warn);
		};
	}, [handleTag]);

	return null;
};
