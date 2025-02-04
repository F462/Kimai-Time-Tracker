import ReactNativeBlobUtil from 'react-native-blob-util';

export const removeFile = async (filePath: string) => {
	if (await ReactNativeBlobUtil.fs.exists(filePath)) {
		await ReactNativeBlobUtil.fs.unlink(filePath);
	}
};
