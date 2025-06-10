import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { CameraView, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

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

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    setScanned(true);
    router.push(`/foodDetails/${data}`);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8'],
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