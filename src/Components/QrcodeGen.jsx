import React, {useState} from 'react';
import {StyleSheet, Text, View, Alert} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {useNavigation} from '@react-navigation/native'; // Import useNavigation

const QrcodeGen = () => {
  const [scanning, setScanning] = useState(true);
  const navigation = useNavigation(); // Get navigation object

  const handleBarCodeRead = ({data}) => {
    try {
      const parsedData = JSON.parse(data); // Parse the QR code data

      // Extract ItemNumber from the details object
      const itemNumber = parsedData.details.ItemNumber;

      if (itemNumber) {
        Alert.alert('QR Code Detected', `Item Number: ${itemNumber}`);
        navigation.navigate('UserList', {itemName: itemNumber}); // Navigate to UserList with itemName
        setScanning(false); // Stop scanning after detecting a QR code
      } else {
        Alert.alert('Invalid QR Code', 'No Item Number found.');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to read QR code data. Please ensure it is valid JSON.',
      );
    }
  };

  return (
    <View style={styles.viewStyle}>
      <Text style={styles.headingStyle}>Tayco</Text>
      <Text style={styles.textStyle}>Scan to find details of the QR code</Text>

      {scanning && (
        <RNCamera
          style={styles.camera}
          onBarCodeRead={handleBarCodeRead}
          captureAudio={false}>
          <View style={styles.overlay}>
            <Text style={styles.textStyle}>Scan a QR Code</Text>
          </View>
        </RNCamera>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  textStyle: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: 'white',
  },
  headingStyle: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default QrcodeGen;