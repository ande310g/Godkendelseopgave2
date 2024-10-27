// ListingView.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { auth, database } from '../Components/firebase';
import { ref, onValue } from 'firebase/database';
import { globalStyles } from './styles';

const ListingView = ({ navigation }) => {
    const [listingInfo, setListingInfo] = useState({}); // State til at gemme opslagets informationer
    const [images, setImages] = useState([]); // State til at gemme billeder tilknyttet opslaget

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const listingRef = ref(database, 'users/' + user.uid + '/residenceInfo'); // Reference til brugerens opslag i databasen
            onValue(listingRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setListingInfo(data); // Sætter opslagets informationer
                    setImages(data.images || []); // Sætter billeder tilknyttet opslaget
                }
            });
        }
    }, []);

    // Funktion til at logge brugeren ud
    const handleLogout = () => {
        auth.signOut()
            .then(() => navigation.navigate('Velkommen')) // Navigerer til 'Velkommen' efter logout
            .catch(error => console.error('Logout error:', error)); // Logger eventuelle fejl ved logout
    };

    // Render funktion til et enkelt billede i gitteret
    const renderImageItem = ({ item }) => (
        <View style={globalStyles.imageContainer}>
            <Image source={{ uri: item }} style={globalStyles.image} />
        </View>
    );

    return (
        <View style={globalStyles.container}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log ud</Text>
            </TouchableOpacity>
            <Text style={globalStyles.title}>Dit opslag</Text>
            <Text>Addresse: {listingInfo.address}</Text>
            <Text>Størrelse på rummet: {listingInfo.roomSize} kvadrameter</Text>
            <Text>Pris: {listingInfo.price} DKK</Text>

            {images.length > 0 && (
                <FlatList
                    data={images}
                    renderItem={renderImageItem} // Renderer hvert billede i gitteret
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={3} // Viser billederne i tre kolonner
                    style={globalStyles.grid}
                />
            )}
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

export default ListingView;
