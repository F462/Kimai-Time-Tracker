import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, StyleSheet, View} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import notifications, {AuthorizationStatus} from 'react-native-notify-kit';
import {Button, Icon, Text, useTheme} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {selectHasSkippedNotificationPermission} from 'src/features/onboarding/context/onboardingSelectors';
import {notificationPermissionSkipped} from 'src/features/onboarding/context/onboardingSlice';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		padding: 24,
	},
	content: {
		alignSelf: 'center',
		maxWidth: 440,
		width: '100%',
	},
	icon: {
		alignSelf: 'center',
		marginBottom: 24,
	},
	title: {
		marginBottom: 16,
		textAlign: 'center',
	},
	message: {
		marginBottom: 24,
		textAlign: 'center',
	},
	button: {
		marginTop: 12,
	},
});

type Props = React.PropsWithChildren;

export const NotificationPermissionGate = ({children}: Props) => {
	const {t} = useTranslation();
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const hasSkippedNotificationPermission = useAppSelector(
		selectHasSkippedNotificationPermission,
	);
	const [isPermissionGranted, setIsPermissionGranted] = useState<
		boolean | null
	>(null);
	const [hasAttemptedPermission, setHasAttemptedPermission] = useState(false);
	const [isRequesting, setIsRequesting] = useState(false);

	useEffect(() => {
		if (Platform.OS !== 'android' || hasSkippedNotificationPermission) {
			return;
		}

		let isCurrent = true;
		notifications
			.getNotificationSettings()
			.then(({authorizationStatus}) => {
				if (!isCurrent) {
					return;
				}

				const isGranted =
					authorizationStatus === AuthorizationStatus.AUTHORIZED;
				setIsPermissionGranted(isGranted);
				setHasAttemptedPermission(
					authorizationStatus === AuthorizationStatus.DENIED,
				);
				if (!isGranted) {
					BootSplash.hide().catch(console.error);
				}
			})
			.catch((error) => {
				console.warn('Unable to check notification permission:', error);
				if (isCurrent) {
					setIsPermissionGranted(false);
					setHasAttemptedPermission(true);
					BootSplash.hide().catch(console.error);
				}
			});

		return () => {
			isCurrent = false;
		};
	}, [hasSkippedNotificationPermission]);

	if (
		Platform.OS !== 'android' ||
		isPermissionGranted ||
		hasSkippedNotificationPermission
	) {
		return <>{children}</>;
	}

	if (isPermissionGranted === null) {
		return null;
	}

	const requestNotificationPermission = async () => {
		setIsRequesting(true);
		try {
			const {authorizationStatus} = await notifications.requestPermission();
			setIsPermissionGranted(
				authorizationStatus === AuthorizationStatus.AUTHORIZED,
			);
			setHasAttemptedPermission(true);
		} catch (error) {
			console.warn('Unable to request notification permission:', error);
			setHasAttemptedPermission(true);
		} finally {
			setIsRequesting(false);
		}
	};

	return (
		<SafeAreaView
			style={[styles.container, {backgroundColor: theme.colors.background}]}>
			<View style={styles.content}>
				<View style={styles.icon}>
					<Icon
						source="bell-ring-outline"
						color={theme.colors.primary}
						size={56}
					/>
				</View>
				<Text variant="headlineSmall" style={styles.title}>
					{t('onboarding.notificationsTitle')}
				</Text>
				<Text variant="bodyLarge" style={styles.message}>
					{t('onboarding.notificationsMessage')}
				</Text>
				{hasAttemptedPermission && (
					<Text
						variant="bodyMedium"
						style={[styles.message, {color: theme.colors.error}]}>
						{t('onboarding.notificationsDenied')}
					</Text>
				)}
				<Button
					mode="contained"
					icon="bell-outline"
					loading={isRequesting}
					disabled={isRequesting}
					style={styles.button}
					onPress={() => {
						requestNotificationPermission().catch(console.warn);
					}}>
					{t(
						hasAttemptedPermission
							? 'onboarding.checkNotifications'
							: 'onboarding.allowNotifications',
					)}
				</Button>
				<Button
					mode="text"
					disabled={isRequesting}
					style={styles.button}
					onPress={() => dispatch(notificationPermissionSkipped())}>
					{t('onboarding.continueWithoutNotifications')}
				</Button>
				{hasAttemptedPermission && (
					<Button
						mode="outlined"
						icon="cog-outline"
						style={styles.button}
						onPress={() => {
							notifications.openNotificationSettings().catch(console.warn);
						}}>
						{t('onboarding.openNotificationSettings')}
					</Button>
				)}
			</View>
		</SafeAreaView>
	);
};
