// src/Components/AdminLogin.js

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/AntDesign';

const AdminLogin = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'http://10.0.2.2:8525/api/admin/login',
        {
          username,
          password,
        },
      );

      // On successful login, navigate to QR code generation
      if (response.data.token) {
        Alert.alert('Login successful');
        navigation.navigate('QRCodeForm'); // Navigate to QR code generation
      }
    } catch (error) {
      // Handle errors (like invalid credentials)
      Alert.alert(
        'Login failed',
        error.response?.data?.message || 'Invalid credentials',
      );
      navigation.navigate('Home'); // Navigate back to Home on failure
    }
  };

  return (
    <View style={{padding: 20}}>
      <Text>Admin Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{borderWidth: 1, marginBottom: 10, padding: 10}}
      />
      <View style={{position: 'relative'}}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword} // Toggle secureTextEntry based on showPassword state
          style={{borderWidth: 1, marginBottom: 10, padding: 10}}
        />
        <TouchableOpacity
          style={{position: 'absolute', right: 10, top: 10}} // Position the icon
          onPress={() => setShowPassword(prev => !prev)} // Toggle showPassword state
        >
          <Icon name={showPassword ? 'eye' : 'eyeo'} size={20} color="gray" />
        </TouchableOpacity>
      </View>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default AdminLogin;
