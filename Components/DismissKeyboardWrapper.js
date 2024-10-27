//Dele af dette projekt er ved brug af generativ AI
import React from 'react';
import { TouchableWithoutFeedback, Keyboard, View } from 'react-native';

const DismissKeyboardWrapper = ({ children }) => (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: 1 }}>{children}</View>
    </TouchableWithoutFeedback>
);

export default DismissKeyboardWrapper;
