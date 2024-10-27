// Login.js
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from '../Components/firebase';
import DismissKeyboardWrapper from '../Components/DismissKeyboardWrapper';
import { globalStyles } from "./styles";

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                const userRef = ref(database, 'users/' + user.uid);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    navigation.navigate('Hjem');
                } else {
                    navigation.navigate('Info');
                }
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    return (
        <DismissKeyboardWrapper>
            <View style={globalStyles.container}>
                <Text style={globalStyles.title}>Log In</Text>
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={globalStyles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={globalStyles.input}
                    secureTextEntry
                />
                {error ? <Text style={globalStyles.errorText}>{error}</Text> : null}

                <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
                    <Text style={globalStyles.buttonText}>Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('ForgottenPassword')}>
                    <Text style={globalStyles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>
        </DismissKeyboardWrapper>
    );
};

export default Login;
