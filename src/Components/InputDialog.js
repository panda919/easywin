import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Dialog from 'react-native-dialog';
import { BlurView } from '@react-native-community/blur';
import { PLATFORM_IOS, SCREEN_HEIGHT, SCREEN_WIDTH } from '../Constants';
import { hp, wp } from '../Helper/ResponsiveScreen';
import { Colors } from '../Styles/Colors';
import LinearGradient from 'react-native-linear-gradient';

const InputDialog = ({
    loading,
    visible,
    onCancelPress,
    onSavePress,
    onChangeText,
    inputDialogText,
    keyboardType = 'default',
    description,
}) => {
    return (
        <Dialog.Container
            visible={visible}
            blurComponentIOS={<BlurView blurType="light" style={StyleSheet.absoluteFillObject} />}
            contentStyle={{
                borderRadius: 10,
                borderWidth: 2,
                borderColor: 'white',
                width: SCREEN_WIDTH * 0.85,
                minHeight: SCREEN_HEIGHT / 3,
                maxHeight: SCREEN_HEIGHT / 2,
                backgroundColor: 'white',
                justifyContent: 'flex-start',
                alignItems: 'center',
                paddingHorizontal: wp(5),
            }}>
            <View style={styles.dialogView}>
                <View style={styles.textView}>
                    <Text style={{
                        color: Colors.Black,
                        fontSize: 20,
                        fontWeight: '700',
                    }}>{`Vérification du numéro`}</Text>
                    <Text style={{
                        color: Colors.Gray2,
                        fontSize: 15,
                        fontWeight: '400',
                        marginTop: hp(0.8),
                        marginHorizontal: wp(10),
                        textAlign: 'center'
                    }}>{description}</Text>
                </View>
                <Dialog.Input
                    keyboardType={keyboardType}
                    value={inputDialogText}
                    autoCorrect={false}
                    placeholder={'Code de vérification'}
                    placeholderTextColor={Colors.DARK_GRAY}
                    style={{ marginLeft: PLATFORM_IOS ? 0 : wp(3), color: Colors.Black }}
                    wrapperStyle={styles.wrapper}
                    onChangeText={onChangeText}
                />
                <View style={styles.buttonRowView}>
                    {loading ? null : (
                        <TouchableOpacity onPress={onCancelPress}>
                            <LinearGradient
                                colors={[Colors.LIGHT_YELLOW, Colors.YELLOW]}
                                style={styles.button}>
                                <Text style={{
                                    color: Colors.Black,
                                    fontSize: 15,
                                    fontWeight: '700',
                                    paddingHorizontal: wp(4),
                                }}>ANNULER</Text>
                            </LinearGradient>
                        </TouchableOpacity>)}
                    {loading ? (
                        <Loader />
                    ) : (
                        < TouchableOpacity
                            onPress={onSavePress}>
                            <LinearGradient
                                colors={[Colors.LIGHT_YELLOW, Colors.YELLOW]}
                                style={styles.button}>
                                <Text style={{
                                    color: Colors.Black,
                                    fontSize: 15,
                                    fontWeight: '700',
                                    paddingHorizontal: wp(4),
                                }}>VALIDER</Text>
                            </LinearGradient>
                        </TouchableOpacity>)}
                </View>
            </View>
            {loading ? <View style={{ height: wp(3) }} /> : null}
        </Dialog.Container>
    )
}

export default InputDialog

const styles = StyleSheet.create({
    dialogView: {
        flex: 1,
        width: wp(80)
    },
    textView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wrapper: {
        backgroundColor: 'white',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 40,
        borderColor: Colors.DARK_GRAY_2,
        marginTop: hp(2)
    },
    buttonRowView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: wp(80),
    },
    button: {
        height: wp(12),
        paddingHorizontal: wp(4),
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    }
})
