import {useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert} from 'react-native';
import NfcManager, {NfcEvents, TagEvent} from 'react-native-nfc-manager';

import {useAppDispatch} from 'src/features/data/context/store';
import {navigateToScreen} from 'src/features/navigation/context/navigationRef';
import {nfcTagDetected} from '../middleware/nfcThunks';

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
			if (tagId === undefined) {
				return;
			}

			const result = await dispatch(nfcTagDetected(tagId));
			if (
				nfcTagDetected.rejected.match(result) &&
				typeof result.payload === 'string'
			) {
				Alert.alert(t('warning'), t(result.payload), [
					{
						text: t('nfc.goToScreen'),
						onPress: () => navigateToScreen('NfcTags'),
					},
				]);
			}
		},
		[dispatch, t],
	);

	useEffect(() => {
		let cancelled = false;

		// `setEventListener` expects a synchronous callback, so wrap the async
		// handler to keep the promise from floating.
		const onTag = (evt: TagEvent) => {
			handleTag(evt.id).catch(console.warn);
		};

		const initialize = async () => {
			try {
				if (!(await NfcManager.isSupported())) {
					return;
				}

				NfcManager.setEventListener(NfcEvents.DiscoverTag, onTag);
				NfcManager.setEventListener(NfcEvents.DiscoverBackgroundTag, onTag);

				// On Android `start` caches the tag that launched the app
				// (cold start); it is not emitted as an event, so it has to be
				// read back explicitly.
				await NfcManager.start();
				await NfcManager.registerTagEvent();

				const backgroundTag = await NfcManager.getBackgroundTag();
				if (!cancelled && backgroundTag !== null) {
					onTag(backgroundTag);
					await NfcManager.clearBackgroundTag();
				}
			} catch (error) {
				// The user can simply tap the tag again once NFC is available;
				// nothing to surface here.
				console.warn('NFC initialization failed', error);
			}
		};

		initialize().catch(console.warn);

		return () => {
			cancelled = true;
			NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
			NfcManager.setEventListener(NfcEvents.DiscoverBackgroundTag, null);
			NfcManager.unregisterTagEvent().catch(console.warn);
		};
	}, [handleTag]);

	return null;
};
