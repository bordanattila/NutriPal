import { jwtDecode } from 'jwt-decode';

class AuthService {
  // Retrieve user data from the decoded token
  getProfile = () => {
    return this.decodeToken(this.getToken());
  };

  // Check if the user is logged in
  loggedIn = () => {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  };

  // Check if the token is expired
  isTokenExpired = (token) => {
    const decoded = this.decodeToken(token);
    const isExpired = decoded ? decoded.exp < Date.now() / 1000 : true; // Return true if token is invalid or expired
    return isExpired;
  };

  // Retrieve the user token from localStorage
  getToken = () => {
    const token = localStorage.getItem('id_token');
    return localStorage.getItem('id_token');
  };

  // Save user token to localStorage and redirect to dashboard
  login = (idToken) => {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/dashboard');
  };

  // Clear user token and redirect to home
  logout = () => {
    localStorage.removeItem('id_token');
    window.location.assign('/home');
  };

  // Decode the token with error handling
  decodeToken = (token) => {
    try {
      return jwtDecode(token);
    } catch (err) {
      console.error('Token decoding failed:', err);
      return null; // Return null if decoding fails
    }
  };
}

export default new AuthService();
