// Login.js
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from '../Components/firebase';
import DismissKeyboardWrapper from '../Components/DismissKeyboardWrapper';
import { globalStyles } from "./styles";

const Login = ({ navigation }) => {
    const [email, setEmail] = useState(''); // State til at gemme email-input
    const [password, setPassword] = useState(''); // State til at gemme password-input
    const [error, setError] = useState(''); // State til at gemme fejlbesked

    // Funktion til at håndtere login
    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                const userRef = ref(database, 'users/' + user.uid); // Reference til brugerens data i databasen
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    navigation.navigate('Hjem'); // Navigerer til 'Hjem', hvis brugeren findes
                } else {
                    navigation.navigate('Info'); // Navigerer til 'Info', hvis brugeren ikke findes
                }
            })
            .catch((error) => {
                setError(error.message); // Sætter fejlbesked, hvis login mislykkes
            });
    };

    return (
        <DismissKeyboardWrapper>
            <View style={globalStyles.container}>
                <Text style={globalStyles.title}>Log In</Text>
                <TextInput
                    placeholder="Email"
                    value={email} // Email input fra brugeren
                    onChangeText={setEmail} // Opdaterer email state
                    style={globalStyles.input}
                    keyboardType="email-address" // Angiver tastaturtypen som e-mail
                    autoCapitalize="none" // Undgår automatisk store bogstaver
                />
                <TextInput
                    placeholder="Password"
                    value={password} // Password input fra brugeren
                    onChangeText={setPassword} // Opdaterer password state
                    style={globalStyles.input}
                    secureTextEntry // Skjuler password-input
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
