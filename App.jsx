import {View, Text} from 'react-native';
import React from 'react';
import HomeScree from './src/Components/HomeScree';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Scanner from './src/Components/Scanner';
import UserList from './src/Components/UserList';
import QrcodeGen from './src/Components/QrcodeGen';
import Icon from 'react-native-vector-icons/AntDesign';
import {NavigationContainer} from '@react-navigation/native';
import Icon2 from 'react-native-vector-icons/Entypo';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import AdminLogin from './src/Components/AdminLogin';
import QRCodeForm from './src/Components/QRCodeForm'; // Import your QRCodeForm component
import {createNativeStackNavigator} from '@react-navigation/native-stack'; // Updated import

const TabNav = createBottomTabNavigator();
const Stack = createNativeStackNavigator(); // Changed from createStackNavigator to createNativeStackNavigator

// Create a stack navigator for admin screens
const AdminStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Scanner" component={Scanner} />
      <Stack.Screen name="AdminLogin" component={AdminLogin} />
      <Stack.Screen name="QRCodeForm" component={QRCodeForm} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <TabNav.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'white',
            height: 70,
          },
        }}>
        <TabNav.Screen
          name="Home"
          component={HomeScree}
          options={{
            tabBarIcon: ({focused}) => (
              <Icon name="home" size={30} color={focused ? 'blue' : 'black'} />
            ),
          }}
        />
        <TabNav.Screen
          name="Admin" // Change to Admin for better context
          component={AdminStack} // Use the stack navigator here
          options={{
            tabBarIcon: ({focused}) => (
              <Icon3
                name="admin-panel-settings"
                size={30}
                color={focused ? 'blue' : 'black'}
              />
            ),
          }}
        />
        <TabNav.Screen
          name="UserList"
          component={UserList}
          options={{
            tabBarIcon: ({focused}) => (
              <Icon2 name="list" size={30} color={focused ? 'blue' : 'black'} />
            ),
          }}
        />
        <TabNav.Screen
          name="QrcodeGen"
          component={QrcodeGen}
          options={{
            tabBarIcon: ({focused}) => (
              <Icon name="scan1" size={30} color={focused ? 'blue' : 'black'} />
            ),
          }}
        />
      </TabNav.Navigator>
    </NavigationContainer>
  );
};

export default App;
