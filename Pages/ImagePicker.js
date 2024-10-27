// ImagePicker.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, Image, FlatList, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { database, auth, storage } from '../Components/firebase';
import { ref, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { globalStyles } from './styles';
import DismissKeyboardWrapper from "../Components/DismissKeyboardWrapper";

const ImagePickerScreen = ({ navigation }) => {
    const [selectedImages, setSelectedImages] = useState([]); // State til at gemme valgte billeder
    const [uploading, setUploading] = useState(false); // State til at spore upload-status
    const [address, setAddress] = useState(''); // State til adresse
    const [roomSize, setRoomSize] = useState(''); // State til værelsesstørrelse
    const [price, setPrice] = useState(''); // State til pris

    // Funktion til at vælge flere billeder fra billedbiblioteket
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert("Permission to access photo roll is required!");
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
            Alert.alert('Error', 'You can select a maximum of 5 images.');
        }
    };

    // Komprimerer billede for at optimere lagring
    const compressImage = async (uri) => {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );
        return manipulatedImage.uri;
    };

    // Upload et enkelt billede til Firebase Storage og hent download-URL'en
    const uploadImageToStorage = async (imageUri) => {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileName = 'image_' + Math.random().toString(36).substring(2, 15);
        const storageReference = storageRef(storage, `userImages/${auth.currentUser.uid}/${fileName}`);
        await uploadBytes(storageReference, blob);
        return await getDownloadURL(storageReference);
    };

    // Upload billeder i batches
    const uploadBatchedImages = async (imageUris) => {
        const batchSize = 2;
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

    // Gem alle data til Firebase
    const handleSaveData = async () => {
        const user = auth.currentUser;

        if (user) {
            setUploading(true);
            try {
                // Upload billeder og hent URLs
                const imageUrls = await uploadBatchedImages(selectedImages);

                // Gem boliginformation og billeder i Firebase
                const userRef = ref(database, `users/${user.uid}/residenceInfo`);
                await update(userRef, {
                    images: imageUrls,
                    address,
                    roomSize,
                    price,
                    timestamp: Date.now() // Valgfri: til at spore, hvornår det blev gemt
                });

                Alert.alert("Success", "Listing saved successfully!");
                navigation.navigate('Hjem');
            } catch (error) {
                console.error('Error saving listing: ', error);
                Alert.alert("Error", "Failed to save listing.");
            } finally {
                setUploading(false);
            }
        }
    };

    // Render billede-gitter
    const renderImageItem = ({ item }) => (
        <View style={globalStyles.imageContainer}>
            <Image source={{ uri: item }} style={globalStyles.image} />
        </View>
    );

    return (
        <DismissKeyboardWrapper>
            <View style={globalStyles.container}>
                <Text style={globalStyles.title}>Tilføj detaljer angående boligen</Text>
                <TextInput
                    placeholder="Address"
                    value={address}
                    onChangeText={setAddress}
                    style={globalStyles.input}
                />
                <TextInput
                    placeholder="Værelses størrelse (kvadrat meter)"
                    value={roomSize}
                    onChangeText={setRoomSize}
                    keyboardType="numeric"
                    style={globalStyles.input}
                />
                <TextInput
                    placeholder="Pris (DKK)"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    style={globalStyles.input}
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

                {selectedImages.length > 0 && (
                    <TouchableOpacity
                        style={[globalStyles.button, { backgroundColor: uploading ? '#aaa' : '#007bff' }]}
                        onPress={handleSaveData}
                        disabled={uploading}
                    >
                        <Text style={globalStyles.buttonText}>{uploading ? "Oploader..." : "Indsend"}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </DismissKeyboardWrapper>

    );
};

export default ImagePickerScreen;
