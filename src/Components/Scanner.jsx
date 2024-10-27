// src/Components/Scanner.js

import React from 'react';
import {View, Text, Button} from 'react-native';

const Scanner = ({navigation}) => {
  return (
    <View>
      <Text>You need to have Admin Login to use this Features</Text>
      <Button
        title="Admin Login"
        onPress={() => navigation.navigate('AdminLogin')} // Navigate to AdminLogin
      />
    </View>
  );
};

export default Scanner;
