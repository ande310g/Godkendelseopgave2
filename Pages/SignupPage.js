// SignupPage.js
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Components/firebase';
import DismissKeyboardWrapper from '../Components/DismissKeyboardWrapper';
import { globalStyles } from './styles';

const Signup = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignUp = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User registered: ', user);
                navigation.navigate('Info');
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    return (
        <DismissKeyboardWrapper>
            <View style={globalStyles.container}>
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={globalStyles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="Adgangskode"
                    value={password}
                    onChangeText={setPassword}
                    style={globalStyles.input}
                    secureTextEntry
                />
                {error ? <Text style={globalStyles.errorText}>{error}</Text> : null}

                <TouchableOpacity style={globalStyles.button} onPress={handleSignUp}>
                    <Text style={globalStyles.buttonText}>Tilmeld dig</Text>
                </TouchableOpacity>
            </View>
        </DismissKeyboardWrapper>
    );
};

export default Signup;
