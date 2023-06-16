import * as Permissions from 'react-native-permissions';
import ImagePicker from 'react-native-image-crop-picker';
import { Alert, Platform } from 'react-native';
import ImmersiveMode from 'react-native-immersive-mode';

async function askPermission(permission) {
    try {
        const status = await Permissions.check(permission);
        if (status !== Permissions.RESULTS.GRANTED) {
            //if not already granted then ask
            console.log(
                'askPermission status',
                status,
                ' for permission',
                permission,
            );
            const status = await Permissions.request(permission);
            if (status !== Permissions.RESULTS.GRANTED) {
                //user denied on ask
                return false;
            }
        }
        return true;
    } catch (err) {
        console.log('askPermission err', err, ' for permission', permission);
        return false;
    }
}

export async function getCameraGalleryPermissions() {
    //need both permisisons for camera, so ask both on galery and camera
    const { PERMISSIONS } = Permissions;
    let permission = Platform.select({
        android: PERMISSIONS.ANDROID.CAMERA,
        ios: PERMISSIONS.IOS.CAMERA,
    });

    let cameraPermissions = await askPermission(permission);
    console.log('cameraPermissions ', cameraPermissions);
    permission = Platform.select({
        android: Platform.Version > 32 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    });
    let storagePermissions = await askPermission(permission);
    console.log('storagePermissions ', storagePermissions);
    return cameraPermissions && storagePermissions;
}

export const pickFromGallery = async () => {
    let havePermission = await getCameraGalleryPermissions();
    if (!havePermission) {
        permissionsAlert();
        return false;
    } else {
        try {
            let res = await ImagePicker.openPicker({
                width: 300,
                height: 300,
                cropping: true,
                mediaType: 'photo',
                includeBase64: true,
            });
            console.log('gallery res', res);
            return res;
        } catch (err) {
            console.log('pickFromGallery err', err);
            return false;
        }
    }
};

export const pickFromCamera = async () => {
    let havePermission = await getCameraGalleryPermissions();
    if (!havePermission) {
        permissionsAlert();
        return false;
    } else {
        try {
            let res = await ImagePicker.openCamera({
                width: 300,
                height: 300,
                cropping: true,
                mediaType: 'photo',
                includeBase64: true,
            });
            console.log('camera res', res);
            return res;
        } catch (err) {
            console.log('pickFromCamera err', err);
            return false;
        }
    }
};

export function permissionsAlert() {
    //console.log('alert');
    Alert.alert(
        'Permissions Required',
        'Easywin requires Camera & Photos access to function properly. Please go to settings to enable manually.',
        [
            {
                text: 'Cancel',
                onPress: () => {
                    ImmersiveMode.fullLayout(true);
                    ImmersiveMode.setBarMode('BottomSticky');
                    console.log('Cancel Pressed');
                },
                style: 'cancel',
            },
            {
                text: 'Settings',
                onPress: () => {
                    ImmersiveMode.fullLayout(true);
                    ImmersiveMode.setBarMode('BottomSticky');
                    Permissions.openSettings().catch(() =>
                        console.log('cannot open settings'),
                    );
                },
            },
        ],
    );
}