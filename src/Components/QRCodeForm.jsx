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
import RNFS from 'react-native-fs';

const pickupLocations = [
  {PickAreaNr: 20, PickAreaName: '20-FINAL PACK'},
  {PickAreaNr: 22, PickAreaName: '22-WOOD'},
  {PickAreaNr: 24, PickAreaName: '24-WOOD ASSEMBLY'},
  {PickAreaNr: 30, PickAreaName: '30-MC/UP/SCENE'},
  {PickAreaNr: 40, PickAreaName: '40-COSMO FINAL'},
  {PickAreaNr: 50, PickAreaName: '50-SWITCH FINAL'},
  {PickAreaNr: 55, PickAreaName: '55-PPK - PANELS'},
  {PickAreaNr: 56, PickAreaName: '56-PPK - FINAL PACK'},
  {PickAreaNr: 57, PickAreaName: '57-PPK - PANEL SHIELDS'},
  {PickAreaNr: 60, PickAreaName: '60-PNLHARDWARE'},
  {PickAreaNr: 61, PickAreaName: '61-POWER POLE'},
  {PickAreaNr: 62, PickAreaName: '62-POWER POLE METAL'},
  {PickAreaNr: 63, PickAreaName: '63-CGHARDWARE'},
  {PickAreaNr: 70, PickAreaName: '70-CHAIRS'},
  {PickAreaNr: 80, PickAreaName: '80-WAREHOUSE'},
  {PickAreaNr: 'X', PickAreaName: 'X-DO NOT PICK'},
];

const QRCodeForm = () => {
  const [formData, setFormData] = useState({
    // Set default value for Pickup Area
    items: [
      {
        ItemNumber: '',
        ItemName: '',
        ItemDescription: '',
        UOM: '',
        Packets: '',
        SmallText: '',
        plantDate: '',
        PickAreaNr: '',
      },
    ], // State to manage dynamic item entries
  });

  const [qrCodeData, setQRCodeData] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData({...formData, [field]: value});
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({...formData, items: newItems});
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          ItemNumber: '',
          ItemName: '',
          ItemDescription: '',
          UOM: '',
          Packets: '',
          SmallText: '',
          plantDate: '',
          PickAreaNr: '',
        },
      ],
    });
  };

  // Validation function

  const handlePickAreaChange = value => {
    const selectedArea = pickupLocations.find(
      area => area.PickAreaNr === value,
    );
    setFormData({
      ...formData,
      pickAreaNr: selectedArea.PickAreaNr,
      pickAreaName: selectedArea.PickAreaName,
    });
  };

  // QR Code generation
  const handleGenerateQRCode = async () => {
    // Validate plantDate format

    try {
      const {items} = formData;

      // Map items to include PickAreaNr
      const mappedItems = items.map(item => ({
        ItemNumber: item.ItemNumber,
        ItemName: item.ItemName,
        ItemDescription: item.ItemDescription,
        PickAreaNr: item.PickAreaNr, // Use the selected Pick Area Number
        UOM: item.UOM,
        SmallText: item.SmallText,
        Packets: parseInt(item.Packets) || 0,
      }));

      // Create order object with dynamic Order Number
      const order = {
        OrderNr: formData.orderNumber, // Get Order Number from form data
      };

      const response = await axios.post(
        'https://tyacoproject-production.up.railway.app/api/qrcode/generate',
        {
          Items: mappedItems, // Use mapped items with PickAreaNr included
          Order: order,
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

  // PDF generation function (same as before)
  const generatePDF = async () => {
    let labelsContent = ''; // Initialize an empty string to hold all labels

    // Check if qrCodeData and Items are defined
    if (!qrCodeData || !qrCodeData.Items) {
      Alert.alert('Error', 'QR Code data is not available for PDF generation.');
      return; // Exit the function if data is not available
    }

    // Loop through each item in the Items array to generate individual labels
    qrCodeData.Items.forEach(item => {
      labelsContent += `
     <div style="width: 3in; height: 5in; border: 1px solid #000; padding: 10px; font-family: Arial, sans-serif; margin-bottom: 20px;">
       <!-- Order and Item number section -->
       <div style="text-align:center; margin-bottom :20px;">
         <h1 style="color:red; font-size :24px; font-weight:bold;">
           ORDER # ${qrCodeData.Order.OrderNr}
         </h1>
         <h2 style="color :blue; font-size :20px; font-weight:bold;">
           ITEM # ${item.ItemNumber}
         </h2>
       </div>

       <!-- Description Section -->
       <div style="text-align:center; margin-bottom :15px;">
         <p style="color :orange; font-size :18px;">
           ${item.ItemDescription || 'DESCRIPTION LONG LOREM IPSUM DOLOR'}
         </p>
         -
         <p style="font-size :12px; color :gray;">
           ${item.SmallText || 'Small Text Here'}
         </p>
        
         <p style="color :green; font-size :16px;">
           - ${item.PickAreaName || 'Pick Area Name'}
         </p>
        
         <p style="font-size :12px; color :blue;">
           PLANT DATE : ${item.plantDate}
         </p>
       </div>

       <!-- Quantity and Boxes section -->
       <div style="display:flex; justify-content :space-between; font-size :16px; margin-top :30px;">
         <p>_____/ ${item.Packets}   QTY</p>
         <p>_____/ ______  BOXES</p>
        
      
         
       </div>

       <!-- QR Code Image -->
       <div style="text-align:center; margin-top :30px;">
        <img src="${`https://tyacoproject-production.up.railway.app${qrCodeData.qrCodeUrl}`}" alt="QR Code" style="width :100px; height :100px;" />
       </div>
     </div>
   `;
    });

    try {
      // Request storage permission before generating the PDF
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) return;

      // Generate PDF
      const pdf = await RNHTMLtoPDF.convert({
        html: labelsContent,
        fileName: 'qrcode_label',
        directory: 'Documents',
      });

      // Get the path to Downloads folder (this will vary depending on the platform)
      const downloadsPath = `${RNFS.DownloadDirectoryPath}/qrcode_label.pdf`;

      // Move the file to the Downloads folder (Android-specific)
      await RNFS.moveFile(pdf.filePath, downloadsPath);

      Alert.alert('Success', `PDF saved to:\n${downloadsPath}`);
      console.log('PDF file saved to:', downloadsPath);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate and save PDF');
      console.error(error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      items: [
        {
          ItemNumber: '',
          ItemDescription: '',
          UOM: '',
          SmallText: '',
          ItemName: '',
          Packets: '',
          plantDate: '',
          PickAreaNr: '',
        },
      ],
    });
    setQRCodeData(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>QR Code Generation Form</Text>

      <TextInput
        placeholder="Order Number" // New input for Order Number
        value={formData.orderNumber}
        onChangeText={value => handleInputChange('orderNumber', value)}
        style={styles.input}
      />

      <Text style={styles.itemTitle}>Items:</Text>
      {formData.items.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <TextInput
            placeholder="Item Number"
            value={item.ItemNumber}
            onChangeText={value => handleItemChange(index, 'ItemNumber', value)}
            style={styles.input}
          />
          <TextInput
            placeholder="Item Name"
            value={item.ItemName}
            onChangeText={value => handleItemChange(index, 'ItemName', value)}
            style={styles.input}
          />
          <TextInput
            placeholder="Item Description"
            value={item.ItemDescription}
            onChangeText={value =>
              handleItemChange(index, 'ItemDescription', value)
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Plant Date"
            value={item.plantDate}
            onChangeText={value => handleItemChange(index, 'plantDate', value)}
            style={styles.input}
          />
          <TextInput
            placeholder="Pick Area Number"
            value={item.PickAreaNr}
            onChangeText={value => handleItemChange(index, 'PickAreaNr', value)}
            style={styles.input}
          />

          <TextInput
            placeholder="UOM"
            value={item.UOM}
            onChangeText={value => handleItemChange(index, 'UOM', value)}
            style={styles.input}
          />
          <TextInput
            placeholder="Small Text"
            value={item.SmallText}
            onChangeText={value => handleItemChange(index, 'SmallText', value)}
            style={styles.input}
          />
          <TextInput
            placeholder="Packets"
            value={item.Packets.toString()}
            onChangeText={value => handleItemChange(index, 'Packets', value)}
            style={styles.input}
            keyboardType="numeric"
          />
        </View>
      ))}

      <Button title="Add Item" onPress={addItem} color="#007BFF" />

      <View style={styles.buttonContainer}>
        <Button
          title="Generate QR Code"
          onPress={handleGenerateQRCode}
          color="#007BFF"
        />
      </View>

      {qrCodeData && (
        <View style={styles.qrCodeContainer}>
          <Image
            source={{
              uri: `https://tyacoproject-production.up.railway.app${qrCodeData.qrCodeUrl}`,
            }}
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
