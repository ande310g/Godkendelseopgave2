// Welcome.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from './styles';

const Welcome = ({ navigation }) => {
    return (
        <View style={globalStyles.container}>
            <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('Log ind')}>
                <Text style={globalStyles.buttonText}>Log ind</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 20 }}>
                <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('Tilmeld dig')}>
                    <Text style={globalStyles.buttonText}>Tilmeld dig</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Welcome;
