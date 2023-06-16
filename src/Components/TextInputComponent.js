import React, { useState } from 'react'
import { Colors } from '../Styles/Colors'
import TextInput from './TextInput'

const TextInputComponent = (props) => {
  const [value, setValue] = useState('')

  return (
    <TextInput
      style={{
        borderColor: Colors.APP_BORDER_GRAY_COLOR,
        borderWidth: 1,
        width: '100%',
      }}
      textInputStyle={{ width: '100%', color: Colors.Black }}
      keyboardType="numeric"
      onChangeText={text => {
        let newText = '';
        let numbers = '0123456789';

        for (var i = 0; i < text.length; i++) {
          if (numbers.indexOf(text[i]) > -1) {
            newText = newText + text[i];
          }
        }
        if (newText > props?.userReducer?.userProfile?.wallet?.ticket) {
          newText = `${props?.userReducer?.userProfile?.wallet?.ticket}`;
        }
        props?.onChange(newText);
        setValue(newText)
      }}
      value={value}
    />
  )
}

export default TextInputComponent