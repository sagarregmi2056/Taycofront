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
  const searchItem = async itemNumber => {
    if (!itemNumber) return; // Prevent empty searches
    try {
      const response = await axios.get(
        `http://10.0.2.2:8525/api/qrcode/search?ItemNumber=${itemNumber}`,
      );
      if (response.data.qrCode) {
        setOrders([response.data.qrCode]); // Set the result as a single-item array
        setErrors('');
      } else {
        setErrors('Item not found.');
      }
    } catch (error) {
      console.log(error);
      setErrors('Item not found.');
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
      <Text style={styles.textStyle}>ID: {item._id}</Text>
      <Text style={styles.textStyle}>
        Number of Packets: {item.numberOfPackets}
      </Text>
      <Text style={styles.textStyle}>Items Name: {item.itemsName}</Text>
      <Text style={styles.textStyle}>Details:</Text>
      <Text style={styles.textStyle}>Tracking ID: {item.trackingId}</Text>
      <Text style={styles.textStyle}>Order ID: {item.orderId}</Text>
      <Text style={styles.textStyle}>Item Number: {item.Item.ItemNumber}</Text>
      <Image
        source={{uri: item.qrCodeUrl}} // Use the Base64 image directly
        style={styles.imageStyle}
        onError={error =>
          console.log('Image loading error:', error.nativeEvent.error)
        } // Debugging line
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
    backgroundColor: '#fff',
  },
  orderItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 10,
  },
  textStyle: {
    fontSize: 18,
    marginVertical: 2,
    color: 'black',
  },
  headingStyle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
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
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
});

export default UserList;
