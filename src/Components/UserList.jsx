import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Button,
  Image,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import axios from 'axios';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Print from 'react-native-print';

const UserList = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const route = useRoute(); // Get navigation parameters

  // Function to fetch all orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        'https://tyacoproject-production.up.railway.app/api/qrcode/allqrcode',
      );
      if (response.data && response.data.data) {
        setOrders(response.data.data);
        setErrors('');
      } else {
        setErrors('No orders found.');
      }
    } catch (error) {
      console.log(error);
      setErrors('Failed to load orders.');
    }
  };

  // Function to search for an item by ItemNumber
  const searchItem = async OrderNr => {
    if (!OrderNr) return; // Prevent empty searches
    try {
      const response = await axios.get(
        `https://tyacoproject-production.up.railway.app/api/qrcode/search?OrderNr=${OrderNr}`,
      );
      if (response.data.qrCode) {
        setOrders([response.data.qrCode]); // Set the result as a single-item array
        setSelectedOrder(response.data.qrCode); // Set the selected order
        setErrors('');
      } else {
        setErrors('Order not found.');
      }
    } catch (error) {
      console.log(error);
      setErrors('Failed to find the order.');
    }
  };

  // This hook runs whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchOrders(); // Fetch orders when the tab is focused
    }, []), // Empty dependency array to make sure it only runs on focus
  );

  const renderOrder = ({item}) => (
    <View style={styles.orderItem}>
      <Text style={styles.textStyle}>
        Number of Packets: {item.numberOfPackets}
      </Text>
      <Text style={styles.textStyle}>Items Name: {item.itemsName}</Text>
      <Text style={styles.textStyle}>Cost: ${item.cost}</Text>
      <Text style={styles.textStyle}>
        Plant Date: {new Date(item.plantDate).toLocaleDateString()}
      </Text>

      {/* Displaying Order details */}
      <Text style={styles.textStyle}>Order Number: {item.Order.OrderNr}</Text>
      <Text style={styles.textStyle}>Quantity: {item.Order.Quantity}</Text>

      {/* Displaying Pick Area details */}
      <Text style={styles.textStyle}>
        Pick Area Number: {item.PickArea.PickAreaNr}
      </Text>
      <Text style={styles.textStyle}>
        Pick Area Name: {item.PickArea.PickAreaName}
      </Text>

      {/* Display each item in the Items array */}
      {item.Items.map((itemDetail, index) => (
        <View key={itemDetail._id} style={styles.itemTextstyle}>
          <Text style={styles.textStyle}>
            Item {index + 1} Number: {itemDetail.ItemNumber}
          </Text>
          <Text style={styles.textStyle}>
            Description: {itemDetail.ItemDescription}
          </Text>
          <Text style={styles.textStyle}>UOM: {itemDetail.UOM}</Text>
          <Text style={styles.textStyle}>
            Small Text: {itemDetail.SmallText}
          </Text>
        </View>
      ))}

      {/* Display QR Code Image */}
      <Image
        source={{
          uri: `https://tyacoproject-production.up.railway.app${item.qrCodeUrl}`,
        }}
        style={styles.imageStyle}
        onError={error =>
          console.log('Image loading error:', error.nativeEvent.error)
        }
      />

      {/* Save as PDF Button */}
      {/* Save as PDF and Print Buttons */}
      {selectedOrder && selectedOrder._id === item._id && (
        <>
          <Button
            title="Save as PDF"
            onPress={() => generatePDF(item)}
            color="#28A745"
          />
          <Button
            title="Print"
            onPress={() => printPDF(item)}
            color="#007BFF"
          />
        </>
      )}
    </View>
  );

  const printPDF = async order => {
    try {
      // Generate the PDF content first if not already generated
      let labelsContent = '';
      if (!order || !order.Items) {
        Alert.alert('Error', 'Order data is not available for printing.');
        return;
      }

      order.Items.forEach(item => {
        labelsContent += `
          <div style="width: 3in; height: 5in; border: 1px solid #000; padding: 10px; font-family: Arial, sans-serif; margin-bottom: 20px;">
            <!-- Order and Item number section -->
            <div style="text-align:center; margin-bottom :20px;">
              <h1 style="color:red; font-size :24px; font-weight:bold;"> ORDER # ${
                order.Order.OrderNr
              } </h1>
              <h2 style="color :blue; font-size :20px; font-weight:bold;"> ITEM # ${
                item.ItemNumber
              } </h2>
            </div>
            <!-- Description Section -->
            <div style="text-align:center; margin-bottom :15px;">
              <p style="color :orange; font-size :18px;"> ${
                item.ItemDescription || 'DESCRIPTION LONG LOREM IPSUM DOLOR'
              } </p>
              - <p style="font-size :12px; color :gray;"> ${
                item.SmallText || 'Small Text Here'
              } </p>
              <p style="color :green; font-size :16px;"> - ${
                order.PickArea.PickAreaName || 'Pick Area Name'
              } </p>
              <p style="font-size :12px; color :blue;"> PLANT DATE : ${new Date(
                order.plantDate,
              ).toLocaleDateString()} </p>
            </div>
            <!-- Quantity and Boxes section -->
            <div style="display:flex; justify-content :space-between; font-size :16px; margin-top :30px;">
              <p>_____/ ${order.Order.Quantity} QTY</p>
              <p>_____/ ______ BOXES</p>
            </div>
            <!-- QR Code Image -->
            <div style="text-align:center; margin-top :30px;">
          <img src="${`https://tyacoproject-production.up.railway.app${order.qrCodeUrl}`}" alt="QR Code" style="width :100px; height :100px;" />

            </div>
          </div>
        `;
      });

      // Print the PDF content
      await Print.print({
        html: labelsContent,
        name: 'order_label',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to print the PDF');
      console.error(error);
    }
  };

  // Function to generate PDF
  const generatePDF = async order => {
    let labelsContent = '';

    // Check if order and Items are defined
    if (!order || !order.Items) {
      Alert.alert('Error', 'Order data is not available for PDF generation.');
      return;
    }

    // Loop through each item in the Items array to generate individual labels
    order.Items.forEach(item => {
      labelsContent += `
        <div style="width: 3in; height: 5in; border: 1px solid #000; padding: 10px; font-family: Arial, sans-serif; margin-bottom: 20px;">
          <!-- Order and Item number section -->
          <div style="text-align:center; margin-bottom :20px;">
            <h1 style="color:red; font-size :24px; font-weight:bold;"> ORDER # ${
              order.Order.OrderNr
            } </h1>
            <h2 style="color :blue; font-size :20px; font-weight:bold;"> ITEM # ${
              item.ItemNumber
            } </h2>
          </div>
          <!-- Description Section -->
          <div style="text-align:center; margin-bottom :15px;">
            <p style="color :orange; font-size :18px;"> ${
              item.ItemDescription || 'DESCRIPTION LONG LOREM IPSUM DOLOR'
            } </p>
            - <p style="font-size :12px; color :gray;"> ${
              item.SmallText || 'Small Text Here'
            } </p>
            <p style="color :green; font-size :16px;"> - ${
              order.PickArea.PickAreaName || 'Pick Area Name'
            } </p>
            <p style="font-size :12px; color :blue;"> PLANT DATE : ${new Date(
              order.plantDate,
            ).toLocaleDateString()} </p>
          </div>
          <!-- Quantity and Boxes section -->
          <div style="display:flex; justify-content :space-between; font-size :16px; margin-top :30px;">
            <p>_____/ ${order.Order.Quantity} QTY</p>
            <p>_____/ ______ BOXES</p>
          </div>
          <!-- QR Code Image -->
          <div style="text-align:center; margin-top :30px;">
           <img src="${`https://tyacoproject-production.up.railway.app${order.qrCodeUrl}`}" alt="QR Code" style="width :100px; height :100px;" />
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
        fileName: 'order_label',
        directory: 'Documents',
      });

      // Get the path to Downloads folder (this will vary depending on the platform)
      const downloadsPath = `${RNFS.DownloadDirectoryPath}/order_label.pdf`;

      // Move the file to the Downloads folder (Android-specific)
      await RNFS.moveFile(pdf.filePath, downloadsPath);

      Alert.alert('Success', `PDF saved to:\n${downloadsPath}`);
      console.log('PDF file saved to:', downloadsPath);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate and save PDF');
      console.error(error);
    }
  };

  // Function to request storage permission
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

  return (
    <View style={styles.viewStyle}>
      <Text style={styles.headingStyle}>Tayco Order List</Text>

      {/* Search Box */}
      <TextInput
        style={styles.searchInput}
        placeholder="Enter Item Number"
        placeholderTextColor="#FFFFFF"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <Button title="Search" onPress={() => searchItem(searchTerm)} />

      {errors && <Text style={styles.errorStyle}>{errors}</Text>}

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item._id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    padding: 10,
    backgroundColor: '#343a40',
  },
  orderItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    backgroundColor: '#000000',
    padding: 10,
  },
  textStyle: {
    fontSize: 18,
    marginVertical: 2,
    color: '#FFFFFF',
  },
  headingStyle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  imageStyle: {
    width: 300,
    height: 300,
    marginTop: 10,
    resizeMode: 'contain', // Ensure the image scales properly
  },
  errorStyle: {
    color: 'red',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  itemTextstyle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    margin: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#FFFFFF',
    color: '#FFFFFF',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
});

export default UserList;
