import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import logo from '../uploads/logo.png';

const DATA = [
  {
    id: '1',
    nav: 'QrcodeGen',
    title: 'QR Code Scanner',
    imageUrl:
      'https://img.freepik.com/free-vector/smartphone-scanning-qr-code_23-2148628268.jpg',
    icon: 'qrcode',
  },
  {
    id: '2',
    nav: 'Admin',
    title: 'QR Code Generator',
    imageUrl:
      'data:image/png;base64,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',
    icon: 'appstore-o',
  },
  {
    id: '3',
    title: 'Order List',
    nav: 'UserList',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-MaIfIqPfr-zJEHQjL8eS3uigLRxRUzXzQQ&s',
    icon: 'user',
  },
];

const HomeScreen = ({navigation}) => {
  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(item.nav)}>
      <Image source={{uri: item.imageUrl}} style={styles.image} />
      <Icon name={item.icon} size={30} color="#4F8EF7" style={styles.icon} />
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Image source={logo} style={styles.logo} />
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
      />
      {/* Footer Section */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 Tayco. All rights reserved.
        </Text>
        <View style={styles.footerIcons}>
          <Icon name="home" size={24} color="#4F8EF7" />
          <Icon name="user" size={24} color="#4F8EF7" />
          <Icon name="setting" size={24} color="#4F8EF7" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#343a40', // Light background color
  },
  logo: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  card: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#5f9ea0',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 1}, // iOS shadow
    shadowOpacity: 0.2, // iOS shadow
    shadowRadius: 1.5, // iOS shadow
    alignItems: 'center',
    paddingVertical: 10,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  title: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  icon: {
    position: 'absolute',
    top: -15,
    right: -15,
  },
  footer: {
    backgroundColor: '#343a40', // Dark background for footer
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto', // Push footer to the bottom
    borderTopWidth: 1, // Optional border on top of footer
    borderTopColor: '#ccc', // Optional border color
  },
  footerText: {
    color: '#ffffff', // White text for footer
    marginBottom: 10, // Spacing below copyright text
  },
  footerIcons: {
    flexDirection: 'row', // Align icons in a row
    justifyContent: 'space-around', // Space icons evenly
    width: '60%', // Set width for icons container
  },
});

export default HomeScreen;
