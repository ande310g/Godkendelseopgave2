// UserInfo.js
import React, { useState } from 'react';
import { View, TextInput, Text, Switch, Image, FlatList, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ref, set, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, auth, storage } from '../Components/firebase';
import DismissKeyboardWrapper from '../Components/DismissKeyboardWrapper';
import { globalStyles } from './styles';

const UserInfo = ({ navigation }) => {
    const [name, setName] = useState(''); // State til navn
    const [age, setAge] = useState(''); // State til alder
    const [hasPlace, setHasPlace] = useState(false); // State til boligstatus
    const [bio, setBio] = useState(''); // State til bio
    const [error, setError] = useState(''); // State til fejlbesked
    const [selectedImages, setSelectedImages] = useState([]); // State til valgte billeder
    const [uploading, setUploading] = useState(false); // State til upload-status

    // Funktion til at vælge billeder fra biblioteket
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

    // Komprimerer billede for optimeret lagring
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

    // Funktion til at håndtere indsendelse af data
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

                if (hasPlace) {
                    navigation.navigate('Vælg billeder');
                } else {
                    navigation.navigate('Hjem');
                }
            } catch (error) {
                setError(error.message);
                setUploading(false);
            }
        }
    };

    // Render funktion til et enkelt billede i gitteret
    const renderImageItem = ({ item }) => (
        <View style={globalStyles.imageContainer}>
            <Image source={{ uri: item }} style={globalStyles.image} />
        </View>
    );

    return (
        <DismissKeyboardWrapper>
            <View style={globalStyles.container}>
                <TextInput
                    placeholder="Navn"
                    value={name} // Input til navn
                    onChangeText={setName} // Opdaterer navn state
                    style={globalStyles.input}
                />
                <TextInput
                    placeholder="Alder"
                    value={age} // Input til alder
                    onChangeText={setAge} // Opdaterer alder state
                    keyboardType="number-pad"
                    style={globalStyles.input}
                />

                {/* Switch for boligstatus */}
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
                    value={bio} // Input til bio
                    onChangeText={setBio} // Opdaterer bio state
                    style={globalStyles.input}
                    multiline
                />

                <TouchableOpacity style={globalStyles.button} onPress={pickImage}>
                    <Text style={globalStyles.buttonText}>Vælg billeder</Text>
                </TouchableOpacity>

                {selectedImages.length > 0 && (
                    <FlatList
                        data={selectedImages}
                        renderItem={renderImageItem} // Renderer hvert billede i gitteret
                        keyExtractor={(item, index) => index.toString()}
                        numColumns={3} // Viser billederne i tre kolonner
                        style={globalStyles.grid}
                    />
                )}

                {error ? <Text style={globalStyles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                    style={[globalStyles.button, { backgroundColor: uploading ? '#aaa' : '#007bff' }]}
                    onPress={handleSubmit} // Håndterer indsendelse af data
                    disabled={uploading}
                >
                    <Text style={globalStyles.buttonText}>{uploading ? "Uploader..." : "Indsend"}</Text>
                </TouchableOpacity>
            </View>
        </DismissKeyboardWrapper>
    );
};

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
});

export default UserInfo;
