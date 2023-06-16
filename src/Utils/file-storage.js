import RNFS from 'react-native-fs';
import path from 'react-native-path';

const makeAppDocsDir = async () => {
    try {
        const dirPath = RNFS.DocumentDirectoryPath + '/images/';
        return await RNFS.mkdir(dirPath, { NSURLIsExcludedFromBackupKey: false });
    } catch (e) {
        console.error(e);
    }
};

export const readFile = async (filePath) => {
	try {
		return await RNFS.readFile(filePath, 'base64');
	} catch (e) {
		console.error(e);
	}
};

export const saveFile = async (fromPath) => {
    try {
        const filename = path.basename(fromPath);
        const toPath = RNFS.DocumentDirectoryPath + '/images/' + filename;

        await makeAppDocsDir();
        await RNFS.copyFile(fromPath, toPath);
        return '/images/' + filename;
    } catch (e) {
        console.error(e);
    }
};