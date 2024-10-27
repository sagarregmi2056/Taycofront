import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import axios from 'axios';
import {Picker} from '@react-native-picker/picker';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs'; // PDF generator

const QRCodeForm = () => {
  const [formData, setFormData] = useState({
    numberOfPackets: '',
    itemsName: '',
    details: '',
    trackingId: '',
    orderId: '',
    sensitivity: 'low',
    pickupLocation: '',
    plantDate: '',
    pickAreaNr: '',
    pickAreaName: '',
    itemNumber: '',
    itemDescription: '',
    itemUOM: '',
    itemSmallText: '',
    cost: '',
  });

  const [qrCodeData, setQRCodeData] = useState(null); // State for QR code data

  const handleInputChange = (field, value) => {
    setFormData({...formData, [field]: value});
  };

  // Validation function
  const validateFields = () => {
    const {numberOfPackets, pickAreaNr} = formData;
    if (!numberOfPackets || isNaN(numberOfPackets) || numberOfPackets <= 0) {
      Alert.alert(
        'Validation Error',
        'Number of Packets must be a positive number.',
      );
      return false;
    }
    if (!pickAreaNr || isNaN(pickAreaNr) || pickAreaNr <= 0) {
      Alert.alert(
        'Validation Error',
        'Pick Area Number must be a positive number.',
      );
      return false;
    }
    return true;
  };

  // QR Code generation
  const handleGenerateQRCode = async () => {
    if (!validateFields()) return;

    try {
      const {
        numberOfPackets,
        itemsName,
        details,
        trackingId,
        orderId,
        sensitivity,
        pickupLocation,
        plantDate,
        pickAreaNr,
        pickAreaName,
        itemNumber,
        itemDescription,
        itemUOM,
        itemSmallText,
        cost,
      } = formData;

      const pickArea = {
        PickAreaNr: parseInt(pickAreaNr),
        PickAreaName: pickAreaName,
      };

      const item = {
        ItemNumber: itemNumber,
        ItemDescription: itemDescription,
        PickAreaNr: parseInt(pickAreaNr),
        UOM: itemUOM,
        SmallText: itemSmallText,
      };

      const order = {
        OrderNr: parseInt(orderId),
        Quantity: parseInt(numberOfPackets),
      };

      const response = await axios.post(
        'http://10.0.2.2:8525/api/qrcode/generate',
        {
          numberOfPackets: parseInt(numberOfPackets),
          itemsName,
          details,
          trackingId,
          orderId,
          sensitivity,
          pickupLocation,
          plantDate,
          PickArea: pickArea,
          Item: item,
          Order: order,
          cost: parseFloat(cost),
        },
      );

      setQRCodeData(response.data.qrCode);

      Alert.alert('Success', 'QR Code generated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate QR Code');
      console.error(error);
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to download files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // PDF generation
  const generatePDF = async () => {
    if (!qrCodeData) {
      Alert.alert('Error', 'No QR Code data available to generate PDF');
      return;
    }

    const htmlContent = `
      <div style="width: 3in; height: 5in; border: 1px solid #000; padding: 10px; font-family: Arial, sans-serif;">
      <!-- Order and Item number section -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: red; font-size: 24px; font-weight: bold;">
          ORDER # ${qrCodeData.orderId}
        </h1>
        <h2 style="color: blue; font-size: 20px; font-weight: bold;">
          ITEM # ${qrCodeData.Item.ItemNumber}
        </h2>
      </div>

      <!-- Description Section -->
      <div style="text-align: center; margin-bottom: 15px;">
        <p style="color: orange; font-size: 18px;">
          ${
            qrCodeData.Item.ItemDescription ||
            'DESCRIPTION LONG LOREM IPSUM DOLOR'
          }
        </p>
        <p style="font-size: 12px; color: gray;">
          ${qrCodeData.Item.SmallText || 'Small Text Here'}
        </p>
        <p style="color: green; font-size: 16px;">
          ${qrCodeData.Item.PickAreaName || 'Pick Area Name'}
        </p>
         <p style="color: green; font-size: 16px;">
          ${qrCodeData.Item.PickAreaNr || 'Pick Area Number'}
        </p>
        <p style="font-size: 12px; color: gray;">
          PLANT DATE: ${new Date(qrCodeData.plantDate).toLocaleDateString()}
        </p>
      </div>

      <!-- Quantity and Boxes section -->
      <div style="display: flex; justify-content: space-between; font-size: 16px; margin-top: 30px;">
        <p>QTY: ${qrCodeData.numberOfPackets}</p>
        <p>Boxes: </p>
         <p>QTY: ${qrCodeData.Item.UOM}</p>

      </div>

      <!-- QR Code Image -->
      <div style="text-align: center; margin-top: 30px;">
        <img src="${
          qrCodeData.qrCodeUrl
        }" alt="QR Code" style="width: 100px; height: 100px;" />
      </div>
    </div>
    `;

    try {
      const pdf = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: 'qrcode_label',
        directory: 'Documents',
      });
      // Get the path to Downloads folder (this will vary depending on the platform)
      const downloadsPath = RNFS.DownloadDirectoryPath + '/qrcode_label.pdf';

      // Move the file to the Downloads folder (Android-specific)
      await RNFS.moveFile(pdf.filePath, downloadsPath);

      Alert.alert('Success', `PDF saved to: ${downloadsPath}`);
      console.log('PDF file saved to:', downloadsPath);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate and save PDF');
      console.error(error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      numberOfPackets: '',
      itemsName: '',
      details: '',
      trackingId: '',
      orderId: '',
      sensitivity: 'low',
      pickupLocation: '',
      plantDate: '',
      pickAreaNr: '',
      pickAreaName: '',
      itemNumber: '',
      itemDescription: '',
      itemUOM: '',
      itemSmallText: '',
      cost: '',
    });
    setQRCodeData(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>QR Code Generation Form</Text>

      {[
        'numberOfPackets',
        'itemsName',
        'details',
        'trackingId',
        'orderId',
        'pickupLocation',
        'plantDate',
        'pickAreaNr',
        'pickAreaName',
        'itemNumber',
        'itemDescription',
        'itemUOM',
        'itemSmallText',
        'cost',
      ].map(field => (
        <TextInput
          key={field}
          placeholder={field.split(/(?=[A-Z])/).join(' ')} // Split camelCase to words
          value={formData[field]}
          onChangeText={value => handleInputChange(field, value)}
          style={styles.input}
          keyboardType={
            ['numberOfPackets', 'pickAreaNr', 'orderId', 'cost'].includes(field)
              ? 'numeric'
              : 'default'
          }
        />
      ))}

      <Text>Pick Sensitivity:</Text>
      <Picker
        selectedValue={formData.sensitivity}
        style={{height: 50, width: '100%', marginBottom: 10}}
        onValueChange={itemValue =>
          handleInputChange('sensitivity', itemValue)
        }>
        <Picker.Item label="Low" value="low" />
        <Picker.Item label="Medium" value="medium" />
        <Picker.Item label="High" value="high" />
      </Picker>

      <View style={styles.buttonContainer}>
        <Button
          title="Generate QR Code"
          onPress={handleGenerateQRCode}
          color="#007BFF"
        />
      </View>

      {qrCodeData && (
        <View style={styles.qrCodeContainer}>
          <Text style={styles.qrCodeLabel}>QR Code Label</Text>
          {[
            'numberOfPackets',
            'itemsName',
            'trackingId',
            'orderId',
            'sensitivity',
            'plantDate',
          ].map(field => (
            <Text key={field}>{`${field.split(/(?=[A-Z])/).join(' ')}: ${
              qrCodeData[field]
            }`}</Text>
          ))}
          <Text>Pick Area: {qrCodeData.PickArea.PickAreaName}</Text>
          <Text>Item Description: {qrCodeData.Item.ItemDescription}</Text>
          <Image
            source={{uri: qrCodeData.qrCodeUrl}}
            style={{width: 150, height: 150, marginTop: 10}}
          />
          <Button title="Generate PDF" onPress={generatePDF} color="#28A745" />
        </View>
      )}

      <Button title="Reset Form" onPress={resetForm} color="#FF6347" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 40,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 50,
  },
  qrCodeContainer: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  qrCodeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default QRCodeForm;
