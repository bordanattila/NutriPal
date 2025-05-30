/**
 * @file BarcodeScanner.jsx
 * @description A React component for scanning barcodes using the device camera and Quagga2.
 */
import React, { useState, useEffect, useRef } from 'react';
import Quagga from '@ericblade/quagga2';

/**
 * BarcodeScanner Component
 * 
 * @component
 * @param {Object} props
 * @param {function} props.onDetected - Callback function triggered when a valid barcode is detected.
 * @param {function} props.onError - Optional callback for handling initialization errors.
 * @returns {JSX.Element}
 */
const BarcodeScanner = ({ onDetected, onError }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  // const detectionsCount = useRef({});

  /**
 * Callback triggered when a barcode is successfully detected.
 * @param {Object} result - The detection result object from Quagga.
 */
  useEffect(() => {
    function handleDetected(result) {
      const code = result.codeResult.code;
      // const format = result.codeResult.format;

      const isValid = isValidEAN13(code);
      if (isValid) {
        Quagga.stop();
        onDetected(code);
      }
    };

    // Only initialize if DOM ref exists
    if (scannerRef.current) {
      // Initialize Quagga2 with configuration
      Quagga.init(
        {
          inputStream: {
            type: 'LiveStream',
            target: scannerRef.current, // Mount the video stream to this element
            constraints: {
              width: 1280,
              height: 720,
              facingMode: 'environment' // Use the back camera on mobile devices
            },
          },
          locator: {
            patchSize: "large",
            halfSample: false
          },
          decoder: {
            // Limit to UPC barcode readers for performance
            readers: [
              'ean_reader'
            ]
          },
          locate: true // Enable locating the barcode in the image
        },
        (err) => {
          if (err) {
            console.error('Quagga initialization error:', err);
            if (onError) onError(err);
            return;
          }
          console.log('Quagga initialized successfully');
          Quagga.start();
          setScanning(true);
        }
      );

      // Set up the event listener for when a barcode is detected
      Quagga.onDetected(handleDetected);
      // Set up a listener for processing errors
      Quagga.onProcessed(handleProcessed);
    }

    // Clean on unmount
    return () => {
      if (scanning) {
        Quagga.stop();
        setScanning(false);
      }
    };
  }, [onDetected, onError, scanning]);

  /**
   * Validates an EAN-13 barcode.
   * @param {string} code - EAN-13 code as a string.
   * @returns {boolean} Whether the code passes the checksum.
   */
  function isValidEAN13(code) {
    if (!/^\d{13}$/.test(code)) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(code[i], 10);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(code[12], 10);
  }

  /**
   * Handles the visual feedback for Quagga's detection processing.
   * @param {Object} result - Result object with image processing data.
   */
  const handleProcessed = (result) => {
    const drawingCtx = Quagga.canvas.ctx.overlay;
    const drawingCanvas = Quagga.canvas.dom.overlay;

    if (result) {
      if (drawingCtx && drawingCanvas) {
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

        if (result.boxes) {
          result.boxes.filter(box => box !== result.box).forEach(box => {
            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
          });
        }

        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
        }

        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
        }
      }
    }
  };

  return (
    <>
      {/* Video stream container where Quagga mounts the camera feed */}
      <div id="scanner-container"
        ref={scannerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '50vh',
          overflow: 'hidden'
        }}
      >
      </div>
      {/* Visual overlay box */}
      <div className="scanner-overlay" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '10%',
          width: '80%',
          height: '50%',
          border: '2px solid #00FF00',
          boxSizing: 'border-box'
        }}></div>
      </div>
    </>
  );
};

export default BarcodeScanner;
