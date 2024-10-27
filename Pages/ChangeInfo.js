//Dele af denne kode er lavet med generativ AI

// Importer nødvendige biblioteker og komponenter
import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Switch, Image, FlatList, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ref, set, update, onValue } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, auth, storage } from '../Components/firebase';
import DismissKeyboardWrapper from '../Components/DismissKeyboardWrapper';
import { globalStyles } from './styles';

const ChangeInfo = ({ navigation }) => {
    // State variabler til at håndtere brugerens data
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [hasPlace, setHasPlace] = useState(false);
    const [bio, setBio] = useState('');
    const [error, setError] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Hent brugerdata fra Firebase når komponenten loader
    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const userRef = ref(database, 'users/' + user.uid);
            onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    const userInfo = snapshot.val();
                    setName(userInfo.name || '');
                    setAge(userInfo.age || '');
                    setHasPlace(userInfo.hasPlace || false);
                    setBio(userInfo.bio || '');
                    setSelectedImages(userInfo.images || []);
                }
            });
        }
    }, []);

    // Funktion til at vælge billede fra brugerens galleri
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert("Tilladelse til at få adgang til fotos er påkrævet!");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.5,
        });

        if (!result.canceled && result.assets.length <= 5) {
            setSelectedImages((prevImages) => [...prevImages, ...result.assets.map(asset => asset.uri)]);
        } else if (result.assets.length > 5) {
            Alert.alert('Fejl', 'Du kan vælge maksimalt 5 billeder.');
        }
    };

    // Funktion til at slette et valgt billede
    const deleteImage = (imageUri) => {
        setSelectedImages((prevImages) => prevImages.filter(img => img !== imageUri));
    };

    // Funktion til at komprimere billedet før upload
    const compressImage = async (uri) => {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );
        return manipulatedImage.uri;
    };

    // Upload et billede til Firebase Storage
    const uploadImageToStorage = async (imageUri) => {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileName = 'image_' + Math.random().toString(36).substring(2, 15);
        const storageReference = storageRef(storage, `userImages/${auth.currentUser.uid}/${fileName}`);
        await uploadBytes(storageReference, blob);
        return await getDownloadURL(storageReference);
    };

    // Funktion til batch-upload af billeder
    const uploadBatchedImages = async (imageUris) => {
        const batchSize = 2;  // Antal billeder uploadet ad gangen
        let batchIndex = 0;
        const uploadedUrls = [];
        while (batchIndex < imageUris.length) {
            const batch = imageUris.slice(batchIndex, batchIndex + batchSize);
            const uploadPromises = batch.map(async (imageUri) => {
                const compressedUri = await compressImage(imageUri);
                return await uploadImageToStorage(compressedUri);
            });
            const batchUrls = await Promise.all(uploadPromises);
            uploadedUrls.push(...batchUrls);
            batchIndex += batchSize;
        }
        return uploadedUrls;
    };

    // Funktion til at håndtere data og billede-upload ved submit
    const handleSubmit = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await set(ref(database, 'users/' + user.uid), {
                    name,
                    age,
                    hasPlace,
                    bio,
                });

                if (selectedImages.length > 0) {
                    setUploading(true);
                    const imageUrls = await uploadBatchedImages(selectedImages);
                    await update(ref(database, 'users/' + user.uid), {
                        images: imageUrls,
                    });
                    setUploading(false);
                    Alert.alert("Succes", "Billederne var uploadet korrekt");
                }

                navigation.navigate('Hjem');
            } catch (error) {
                setError(error.message);
                setUploading(false);
            }
        }
    };

    // Render hvert billede i gitteret
    const renderImageItem = ({ item }) => (
        <View style={globalStyles.imageContainer}>
            <Image source={{ uri: item }} style={globalStyles.image} />
            <TouchableOpacity onPress={() => deleteImage(item)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>X</Text>
            </TouchableOpacity>
        </View>
    );

    // Render funktion til komponent
    return (
        <DismissKeyboardWrapper>
            <View style={globalStyles.container}>
                <TextInput
                    placeholder="Navn"
                    value={name}
                    onChangeText={setName}
                    style={globalStyles.input}
                />
                <TextInput
                    placeholder="Alder"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                    style={globalStyles.input}
                />

                {/* Skift-knap til at vælge boligstatus */}
                <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Leder du et værelse og leder efter en bofælle eller leder du efter et sted at bo?</Text>
                    <View style={styles.switchRow}>
                        <Text style={styles.switchText}>{hasPlace ? 'Har et værelse' : 'Leder efter et sted at bo'}</Text>
                        <Switch
                            value={hasPlace}
                            onValueChange={setHasPlace}
                            trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
                            thumbColor={hasPlace ? '#007bff' : '#f4f3f4'}
                            style={styles.switch}
                        />
                    </View>
                </View>

                <TextInput
                    placeholder="Fortæl os omkring dig selv"
                    value={bio}
                    onChangeText={setBio}
                    style={globalStyles.input}
                    multiline
                />

                <TouchableOpacity style={globalStyles.button} onPress={pickImage}>
                    <Text style={globalStyles.buttonText}>Vælg billeder</Text>
                </TouchableOpacity>

                {selectedImages.length > 0 && (
                    <FlatList
                        data={selectedImages}
                        renderItem={renderImageItem}
                        keyExtractor={(item, index) => index.toString()}
                        numColumns={3}
                        style={globalStyles.grid}
                    />
                )}

                {error ? <Text style={globalStyles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                    style={[globalStyles.button, { backgroundColor: uploading ? '#aaa' : '#007bff' }]}
                    onPress={handleSubmit}
                    disabled={uploading}
                >
                    <Text style={globalStyles.buttonText}>{uploading ? "Uploader..." : "Indsend"}</Text>
                </TouchableOpacity>
            </View>
        </DismissKeyboardWrapper>
    );
};

// Stilarter for knapper og tekst
const styles = StyleSheet.create({
    switchContainer: {
        marginVertical: 20,
        alignItems: 'center',
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '80%',
    },
    switchText: {
        fontSize: 16,
        marginRight: 10,
    },
    switch: {
        transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'red',
        borderRadius: 50,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default ChangeInfo;
