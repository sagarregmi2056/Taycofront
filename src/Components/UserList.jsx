import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Button,
  Image,
} from 'react-native';
import axios from 'axios';
import {useRoute, useFocusEffect} from '@react-navigation/native';

const UserList = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState('');

  const route = useRoute(); // Get navigation parameters

  // Function to fetch all orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        'http://10.0.2.2:8525/api/qrcode/allqrcode',
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
        `http://10.0.2.2:8525/api/qrcode/search?OrderNr=${OrderNr}`,
      );
      if (response.data.qrCode) {
        setOrders([response.data.qrCode]); // Set the result as a single-item array
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
        source={{uri: item.qrCodeUrl}}
        style={styles.imageStyle}
        onError={error =>
          console.log('Image loading error:', error.nativeEvent.error)
        }
      />
    </View>
  );

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
