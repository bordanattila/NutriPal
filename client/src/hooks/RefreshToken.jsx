import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../utils/auth';

const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      if (AuthService.isTokenExpired(AuthService.getToken())) {
        const newToken = await AuthService.refreshToken();
        if (!newToken) {
          navigate('/login');
        }
      }
    };
    checkToken();
  }, [navigate]);
};

export default useAuth;
