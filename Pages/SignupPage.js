// SignupPage.js
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Components/firebase';
import DismissKeyboardWrapper from '../Components/DismissKeyboardWrapper';
import { globalStyles } from './styles';

const Signup = ({ navigation }) => {
    const [email, setEmail] = useState(''); // State til at gemme email-input
    const [password, setPassword] = useState(''); // State til at gemme password-input
    const [error, setError] = useState(''); // State til at gemme fejlbesked

    // Funktion til at håndtere tilmelding
    const handleSignUp = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User registered: ', user); // Logger oplysninger om registreret bruger
                navigation.navigate('Info'); // Navigerer til 'Info' efter vellykket tilmelding
            })
            .catch((error) => {
                setError(error.message); // Sætter fejlbesked, hvis tilmelding mislykkes
            });
    };

    return (
        <DismissKeyboardWrapper>
            <View style={globalStyles.container}>
                <TextInput
                    placeholder="Email"
                    value={email} // Email input fra brugeren
                    onChangeText={setEmail} // Opdaterer email state
                    style={globalStyles.input}
                    keyboardType="email-address" // Angiver tastaturtypen som e-mail
                    autoCapitalize="none" // Undgår automatisk store bogstaver
                />
                <TextInput
                    placeholder="Adgangskode"
                    value={password} // Password input fra brugeren
                    onChangeText={setPassword} // Opdaterer password state
                    style={globalStyles.input}
                    secureTextEntry // Skjuler password-input
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
