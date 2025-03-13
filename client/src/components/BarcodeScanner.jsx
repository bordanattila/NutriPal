import React, { useState, useEffect, useRef } from 'react';
import Quagga from '@ericblade/quagga2';

const BarcodeScanner = ({ onDetected, onError }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  // const detectionsCount = useRef({});

  
  useEffect(() => {
    function handleDetected (result) {
      console.log('detected:', result);
      const code = result.codeResult.code;
      const format = result.codeResult.format;
      
      const isValid = isValidEAN13(code);
      if (isValid) {
        Quagga.stop();
        onDetected(code);
      }
    
  
      console.log(`Detected ${format} code: ${code}`);
  
      // Implement a "vote" system for detected codes to ensure accuracy
      // if (!detectionsCount.current[code]) {
      //   detectionsCount.current[code] = 1;
      // } else {
      //   detectionsCount.current[code]++;
      // }
  
      // If detect the same code multiple times, it's likely correct
      // For EAN-13, also validate the checksum
      // if (detectionsCount.current[code] >= 3 && (format !== 'ean_13' || isValidEAN13(code))) {
      //   console.log('Confirmed code detected:', code);
  
      //   // Reset detections count
      //   detectionsCount.current = {};
  
      //   // Temporarily stop scanning to avoid multiple rapid detections
      //   Quagga.stop();
      //   setScanning(false);
  
      //   if (onDetected) onDetected(code);
  
      //   // Optional: Restart scanning after a short delay
      //   setTimeout(() => {
      //     Quagga.start();
      //     setScanning(true);
      //   }, 1500);
      // }
      // if (onDetected) onDetected(code);
    };
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
            // area: { // This helps focus the scanner on the center of the view
            //   top: "25%",
            //   right: "10%",
            //   left: "10%",
            //   bottom: "25%",
            // },
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
        // Quagga.offDetected(handleDetected);
        // Quagga.offProcessed(handleProcessed);
        Quagga.stop();
        setScanning(false);
      }
    };
  }, [onDetected, onError, scanning]);

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


  // Visual feedback for scanning
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
      <div id="scanner-container"
        ref={scannerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '50vh',
          overflow: 'hidden'
        }}
      >
        {/* Quagga mounts the video stream here */}
      </div>
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
