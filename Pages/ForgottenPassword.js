// ForgottenPassword.js
// Importerer nødvendige moduler og komponenter fra React og React Native
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';

// Importerer Firebase-funktion til at sende en nulstillings-email for kodeord og din Firebase-konfiguration
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../Components/firebase';

// Importerer globale stilarter fra en ekstern fil
import { globalStyles } from './styles';

// Definerer komponenten ForgottenPassword, som modtager navigation som en prop
const ForgottenPassword = ({ navigation }) => {
    // Definerer en lokal tilstand for email (brugernes input) og besked (statusbesked til brugeren)
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    // Funktion, der håndterer nulstilling af kodeord ved at sende en nulstillings-email
    const handlePasswordReset = () => {
        // Anvender Firebase-funktion til at sende nulstillings-email til den indtastede email
        sendPasswordResetEmail(auth, email)
            .then(() => {
                // Hvis succesfuld, opdateres beskeden med en bekræftelsesmeddelelse
                setMessage('Password reset email sent! Please check your inbox.');
            })
            .catch((error) => {
                // Hvis der opstår fejl, opdateres beskeden med fejlmeddelelsen
                setMessage(error.message);
            });
    };

    // Returnerer JSX til brugergrænsefladen, som indeholder tekstinput, knap og eventuelle beskeder
    return (
        <View style={globalStyles.container}>
            <TextInput
                placeholder="Enter your email"  // Tekst der vises som standard i tekstfeltet
                value={email}  // Værdi af tekstfeltet (email-input fra brugeren)
                onChangeText={setEmail}  // Opdaterer email-tilstanden ved ændringer i tekstfeltet
                style={globalStyles.input}  // Anvender styling fra globalStyles
                keyboardType="email-address"  // Sætter tastaturtypen til e-mail for at lette input
                autoCapitalize="none"  // Undgår automatisk store bogstaver
            />
            <TouchableOpacity
                style={globalStyles.button}  // Anvender knap-styling fra globalStyles
                onPress={handlePasswordReset}  // Kalder handlePasswordReset-funktionen ved tryk
            >
                <Text style={globalStyles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
            {message ? <Text style={globalStyles.errorText}>{message}</Text> : null}
        </View>
    );
};

// Eksporterer ForgottenPassword-komponenten, så den kan anvendes i andre filer
export default ForgottenPassword;
