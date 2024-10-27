// ForgottenPassword.js
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../Components/firebase';
import { globalStyles } from './styles';

const ForgottenPassword = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handlePasswordReset = () => {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                setMessage('Password reset email sent! Please check your inbox.');
            })
            .catch((error) => {
                setMessage(error.message);
            });
    };

    return (
        <View style={globalStyles.container}>
            <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                style={globalStyles.input}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TouchableOpacity style={globalStyles.button} onPress={handlePasswordReset}>
                <Text style={globalStyles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
            {message ? <Text style={globalStyles.errorText}>{message}</Text> : null}
        </View>
    );
};

export default ForgottenPassword;
