function convertUpcEtoUpcA(upcE) {
    // Ensure upcE is a string
    if (upcE.length !== 8) {
      // If it's not 8 digits, assume it's already in UPC-A format.
      return upcE;
    }
  
    // Extract parts
    const ns = upcE[0];            // Number system 
    const check = upcE[7];         // The check digit 
    const body = upcE.slice(1, 7);   // The 6-digit compressed code
  
    const A = body[0];
    const B = body[1];
    const C = body[2];
    const D = body[3];
    const E = body[4];
    const F = body[5];
  
    let upcA;
  
    // Conversion algorithm based on the value of the sixth digit
    if (F === '0' || F === '1' || F === '2') {
      // For F = 0, 1, or 2:
      // UPC-A: NS + A + B + F + "0000" + C + D + E
      upcA = ns + A + B + F + '0000' + C + D + E;
    } else if (F === '3') {
      // For F = 3:
      // UPC-A: NS + A + B + C + "00000" + D + E
      upcA = ns + A + B + C + '00000' + D + E;
    } else if (F === '4') {
      // For F = 4:
      // UPC-A: NS + A + B + C + D + "00000" + E
      upcA = ns + A + B + C + D + '00000' + E;
    } else {
      // For F = 5, 6, 7, 8, or 9:
      // UPC-A: NS + A + B + C + D + E + "0000" + F
      upcA = ns + A + B + C + D + E + '0000' + F;
    }
    
    // Optionally, recalculate and append a check digit for UPC-A here if needed.
    // For our purposes, we'll return the 12-digit UPC-A string.
    return upcA;
  }
  
  module.exports = { convertUpcEtoUpcA };