import React, {useCallback, useEffect, useRef, useState} from 'react';

import {BackHandler, Linking, Platform, StyleSheet, View} from 'react-native';
import {Button, Text, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import {
	Barcode,
	useBarcodeScannerOutput,
} from 'react-native-vision-camera-barcode-scanner';
import {
	Camera,
	useCameraDevice,
	useCameraPermission,
} from 'react-native-vision-camera';

import {
	type QrCredentials,
	parseQrCredentials,
} from '../utils/parseQrCredentials';
import {useStyle} from 'src/features/theming/utils/useStyle';

interface QrScannerProps {
	onCredentialsScanned: (credentials: QrCredentials) => void;
	onClose: () => void;
}

const baseStyles = StyleSheet.create({
	container: {
		flex: 1,
	},
	camera: {
		flex: 1,
	},
	centerRow: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		justifyContent: 'center',
		alignItems: 'center',
		pointerEvents: 'none',
	},
	reticle: {
		width: 240,
		height: 240,
		borderWidth: 3,
		borderRadius: 16,
	},
	hintText: {
		fontSize: 16,
		marginTop: 16,
		textAlign: 'center',
		paddingHorizontal: 24,
	},
	bottomBar: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 24,
		paddingBottom: 24,
		gap: 12,
		alignItems: 'center',
	},
	errorText: {
		fontSize: 14,
		textAlign: 'center',
	},
	messageCenter: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
		gap: 16,
	},
	messageText: {
		fontSize: 16,
		textAlign: 'center',
	},
});

export const QrScanner = ({onCredentialsScanned, onClose}: QrScannerProps) => {
	const {t} = useTranslation();
	const theme = useTheme();
	const device = useCameraDevice('back');
	const {hasPermission, canRequestPermission, requestPermission} =
		useCameraPermission();

	const [error, setError] = useState<string | null>(null);
	const hasProcessedScan = useRef(false);

	const handleRequestPermission = useCallback(() => {
		requestPermission().catch(console.error);
	}, [requestPermission]);

	const handleOpenSettings = useCallback(() => {
		const openSettings = async () => {
			if (Platform.OS === 'ios') {
				await Linking.openURL('app-settings:');
			} else {
				await Linking.openSettings();
			}
		};

		openSettings().catch(console.error);
	}, []);

	const styles = useStyle(
		() => ({
			container: {
				...baseStyles.container,
				backgroundColor: theme.colors.background,
			},
			reticle: {...baseStyles.reticle, borderColor: theme.colors.primary},
			hintText: {...baseStyles.hintText, color: theme.colors.onBackground},
			errorText: {...baseStyles.errorText, color: theme.colors.error},
			messageText: {
				...baseStyles.messageText,
				color: theme.colors.onBackground,
			},
			camera: baseStyles.camera,
			centerRow: baseStyles.centerRow,
			bottomBar: baseStyles.bottomBar,
			messageCenter: baseStyles.messageCenter,
		}),
		[
			theme.colors.background,
			theme.colors.primary,
			theme.colors.onBackground,
			theme.colors.error,
		],
	);

	useEffect(() => {
		if (!hasPermission) {
			requestPermission().catch(console.error);
		}
	}, [hasPermission, requestPermission]);

	useEffect(() => {
		const subscription = BackHandler.addEventListener(
			'hardwareBackPress',
			() => {
				onClose();
				return true;
			},
		);

		return () => subscription.remove();
	}, [onClose]);

	const handleBarcodeScanned = useCallback(
		(barcodes: Barcode[]) => {
			if (hasProcessedScan.current) {
				return;
			}

			const qrCode = barcodes.find((barcode) => barcode.format === 'qr-code');
			if (!qrCode?.rawValue) {
				return;
			}

			try {
				const credentials = parseQrCredentials(qrCode.rawValue);
				hasProcessedScan.current = true;
				setError(null);
				onCredentialsScanned(credentials);
			} catch (err) {
				const message = err instanceof Error ? err.message : 'qr.unknownError';
				setError((prev) => (prev === message ? prev : message));
			}
		},
		[onCredentialsScanned],
	);

	const scannerOutput = useBarcodeScannerOutput({
		barcodeFormats: ['qr-code'],
		onBarcodeScanned: handleBarcodeScanned,
		onError: (err) => {
			console.error('Barcode scanner error:', err);
		},
	});

	if (!hasPermission) {
		return (
			<View style={styles.container}>
				<View style={styles.messageCenter}>
					<Text style={styles.messageText}>
						{t('qr.cameraPermissionRequired')}
					</Text>
					{canRequestPermission ? (
						<Button mode="contained" onPress={handleRequestPermission}>
							{t('qr.requestPermission')}
						</Button>
					) : (
						<Button mode="contained" onPress={handleOpenSettings}>
							{t('qr.openSettings')}
						</Button>
					)}
					<Button mode="contained" onPress={onClose}>
						{t('dismiss')}
					</Button>
				</View>
			</View>
		);
	}

	if (!device) {
		return (
			<View style={styles.container}>
				<View style={styles.messageCenter}>
					<Text style={styles.messageText}>{t('qr.noCameraAvailable')}</Text>
					<Button mode="contained" onPress={onClose}>
						{t('dismiss')}
					</Button>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Camera
				isActive={true}
				device={device}
				outputs={[scannerOutput]}
				style={styles.camera}
			/>

			<View style={styles.centerRow}>
				<View style={styles.reticle} />
				<Text style={styles.hintText}>{t('qr.pointAtQrCode')}</Text>
			</View>

			<View style={styles.bottomBar}>
				{error != null && <Text style={styles.errorText}>{t(error)}</Text>}
				<Button mode="contained" onPress={onClose}>
					{t('dismiss')}
				</Button>
			</View>
		</View>
	);
};
