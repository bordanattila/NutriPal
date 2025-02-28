import React, { useEffect, useRef } from 'react';
import Quagga from '@ericblade/quagga2';

const BarcodeScanner = ({ onDetected, onError }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scannerRef.current) {
      // Initialize Quagga2 with configuration
      Quagga.init(
        {
          inputStream: {
            type: 'LiveStream',
            target: scannerRef.current, // Mount the video stream to this element
            constraints: {
              width: 640,
              height: 480,
              facingMode: 'environment' // Use the back camera on mobile devices
            }
          },
          decoder: {
            // Limit to UPC barcode readers for performance
            readers: ['upc_reader', 'upc_e_reader']
          },
          locate: true // Enable locating the barcode in the image
        },
        (err) => {
          if (err) {
            console.error('Quagga initialization error:', err);
            if (onError) onError(err);
            return;
          }
          Quagga.start();
        }
      );

      // Set up the event listener for when a barcode is detected
      Quagga.onDetected(handleDetected);
    }

    // Clean on unmount
    return () => {
      Quagga.offDetected(handleDetected);
      Quagga.stop();
    };
  }, []);

  const handleDetected = (result) => {
    const code = result.codeResult.code;
    console.log('Barcode detected:', code);
    if (onDetected) onDetected(code);
    // Optionally, stop scanning after detection:
    // Quagga.stop();

  };

  return (
    <div
      ref={scannerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Quagga mounts the video stream here */}
    </div>
  );
};

export default BarcodeScanner;
