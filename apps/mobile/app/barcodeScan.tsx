import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { CameraView, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import ky from 'ky';

const api = ky.create({
  prefixUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.13:4000',
});

interface FoodResponse {
  error?: {
    code: number;
    message: string;
  };
  food_id?: {
    value: string;
  };
}

/**
 * Converts a UPC-E barcode to UPC-A format
 * @param {string} upce - The UPC-E barcode
 * @returns {string} The converted UPC-A barcode
 */
function convertUPCEtoUPCA(upce: string): string {
  if (!/^\d{6}$/.test(upce)) return '';
  
  const lastDigit = upce[5];
  let upca = '';
  
  switch (lastDigit) {
    case '0':
    case '1':
    case '2':
      upca = upce.substring(0, 2) + lastDigit + '0000' + upce.substring(2, 5);
      break;
    case '3':
      upca = upce.substring(0, 3) + '00000' + upce.substring(3, 5);
      break;
    case '4':
      upca = upce.substring(0, 4) + '00000' + upce.substring(4, 5);
      break;
    default:
      upca = upce.substring(0, 5) + '0000' + lastDigit;
  }
  
  return upca;
}

/**
 * Converts a barcode to GTIN-13 format
 * @param {string} barcode - The input barcode
 * @returns {string} The GTIN-13 formatted barcode
 */
function convertToGTIN13(barcode: string): string {
  // Remove any non-digit characters
  barcode = barcode.replace(/\D/g, '');
  
  // Handle different barcode formats
  if (barcode.length === 6) {
    // UPC-E
    barcode = convertUPCEtoUPCA(barcode);
  }
  
  if (barcode.length === 8) {
    // EAN-8: Add 5 zeros at the beginning
    barcode = '00000' + barcode;
  } else if (barcode.length === 11 || barcode.length === 12) {
    // UPC-A: Add leading zeros to make it 13 digits
    barcode = barcode.padStart(13, '0');
  }
  
  // Ensure the barcode is 13 digits
  if (barcode.length !== 13) {
    return '';
  }
  
  return barcode;
}

/**
 * Validates a GTIN-13 barcode
 * @param {string} code - The GTIN-13 barcode
 * @returns {boolean} Whether the barcode is valid
 */
function isValidGTIN13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(code[12], 10);
}

export default function BarcodeScanScreen() {
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <Text style={styles.text}>Requesting camera permission</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission is required</Text>
        <Button title="Grant permission" onPress={requestPermission} />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    setScanned(true);
    try {
      console.log('Original barcode:', data);
      
      // Convert barcode to GTIN-13 format
      const gtin13 = convertToGTIN13(data);
      console.log('Converted to GTIN-13:', gtin13);
      
      if (!gtin13 || !isValidGTIN13(gtin13)) {
        Alert.alert(
          "Invalid Barcode",
          "Please scan a valid UPC-A, EAN-13, EAN-8, or UPC-E barcode.",
          [
            {
              text: "OK",
              onPress: () => setScanned(false)
            }
          ]
        );
        return;
      }

      // Check if the barcode exists in the database using the correct endpoint
      console.log('Sending barcode to API:', gtin13);
      const response = await api.get('api/foodByBarcode', {
        searchParams: { barcode: gtin13 }
      }).json() as FoodResponse;
      console.log('API Response:', response);
      
      if (response.error) {
        Alert.alert(
          "Barcode Not Found",
          "This barcode is not in our database. Would you like to add it?",
          [
            {
              text: "Cancel",
              onPress: () => setScanned(false),
              style: "cancel"
            },
            {
              text: "Add Food",
              onPress: () => {
                router.replace(`/addFood/${gtin13}`);
              }
            }
          ]
        );
      } else if (response.food_id?.value) {
        router.replace(`/foodDetails/${response.food_id.value}`);
      } else {
        Alert.alert(
          "Error",
          "Invalid response from server. Please try again.",
          [
            {
              text: "OK",
              onPress: () => setScanned(false)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking barcode:', error);
      Alert.alert(
        "Error",
        "Failed to check barcode. Please try again.",
        [
          {
            text: "OK",
            onPress: () => setScanned(false)
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
      />
      {scanned && (
        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    margin: 20,
    textAlign: 'center',
  },
}); 