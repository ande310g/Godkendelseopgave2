// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Welcome from './Pages/Welcome';
import Login from './Pages/Login';
import Signup from './Pages/SignupPage';
import UserInfo from './Pages/UserInfo';
import Home from './Pages/Home';
import ChangeInfo from './Pages/ChangeInfo';
import ImagePickerScreen from './Pages/ImagePicker';
import ForgottenPassword from './Pages/ForgottenPassword';
import ListingView from './Pages/ListingView';
import { Ionicons } from '@expo/vector-icons';
import { auth, database } from './Components/firebase';
import { ref, onValue } from 'firebase/database';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    const [hasPlace, setHasPlace] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const userRef = ref(database, `users/${user.uid}/hasPlace`);
            onValue(userRef, (snapshot) => {
                setHasPlace(snapshot.val() === true);
            });
        }
    }, []);

    return (
        <Tab.Navigator initialRouteName="Home">
            <Tab.Screen
                name="Om mig"
                component={Home}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" color={color} size={size} />
                    ),
                }}
            />
            {hasPlace && (
                <Tab.Screen
                    name="Se opslag"
                    component={ListingView}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="home" color={color} size={size} />
                        ),
                    }}
                />
            )}
        </Tab.Navigator>
    );
}

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Velkommen">
                <Stack.Screen name="Velkommen" component={Welcome} />
                <Stack.Screen name="Log ind" component={Login} />
                <Stack.Screen name="Tilmeld dig" component={Signup} />
                <Stack.Screen name="Info" component={UserInfo} />
                <Stack.Screen name="Vælg billeder" component={ImagePickerScreen} />
                <Stack.Screen name="Hjem" component={MainTabs} options={{ headerShown: false }} />
                <Stack.Screen name="Skift info" component={ChangeInfo} />
                <Stack.Screen name="ForgottenPassword" component={ForgottenPassword} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
