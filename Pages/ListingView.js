// ListingView.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { auth, database } from '../Components/firebase';
import { ref, onValue } from 'firebase/database';
import { globalStyles } from './styles';

const ListingView = ({ navigation }) => {
    const [listingInfo, setListingInfo] = useState({});
    const [images, setImages] = useState([]);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const listingRef = ref(database, 'users/' + user.uid + '/residenceInfo');
            onValue(listingRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setListingInfo(data);
                    setImages(data.images || []);
                }
            });
        }
    }, []);

    const handleLogout = () => {
        auth.signOut()
            .then(() => navigation.navigate('Velkommen'))
            .catch(error => console.error('Logout error:', error));
    };

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
                    renderItem={renderImageItem}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={3}
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
