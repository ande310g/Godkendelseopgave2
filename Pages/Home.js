// Home.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { auth, database } from '../Components/firebase';
import { ref, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from './styles';

const Home = () => {
    const [userInfo, setUserInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const userRef = ref(database, 'users/' + user.uid);
            onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    setUserInfo(snapshot.val());
                }
                setLoading(false);
            });
        }
    }, []);

    const handleLogout = () => {
        signOut(auth)
            .then(() => navigation.replace('Velkommen'))
            .catch((error) => console.error('Fejl under logout:', error));
    };

    if (loading) {
        return (
            <View style={globalStyles.container}>
                <Text style={globalStyles.title}>Indlæser...</Text>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log ud</Text>
            </TouchableOpacity>
            <Text style={globalStyles.title}>Om mig</Text>
            <Text>Navn: {userInfo.name}</Text>
            <Text>Alder: {userInfo.age}</Text>
            <Text>{userInfo.hasPlace ? 'Jeg har et sted' : 'Leder efter et sted'}</Text>
            <Text>Bio: {userInfo.bio}</Text>

            <TouchableOpacity
                style={globalStyles.button}
                onPress={() => navigation.navigate('Skift info')}
            >
                <Text style={globalStyles.buttonText}>Ændre info omkring dig</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    logoutButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
        backgroundColor: '#FF3B30',
        borderRadius: 5,
    },
    logoutText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default Home;
