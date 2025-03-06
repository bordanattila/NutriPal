import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Auth from '../utils/auth';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER, UPDATE_USER_PROFILE } from '../utils/mutations';
// import ky from 'ky';

// const api = ky.create({
//     prefixUrl: process.env.REACT_APP_API_URL,
// });

const Profile = () => {
    const [user, setUser] = useState({});
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);
    const [calorieGoal, setCalorieGoal] = useState('');
    const [password, setPassword] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    setLoading = false;
    const { loadingQuery, data, loadingError } = useQuery(GET_USER, {
        context: {
          headers: {
            Authorization: `Bearer ${Auth.getToken()}`,
          },
        },
        onError: (err) => {
          console.error(err); 
               // Check if the error is due to an expired token
               if (err.message.includes("Unauthorized")) {
                // Attempt to refresh the token
                const refreshSuccess = Auth.refreshToken();
                if (!refreshSuccess) {
                  navigate('/login');
                }
              } else {
                // For other errors, navigate to login
                navigate('/login'); 
              }
        }
      });

      user = null;
      
      const [updateUserProfile, { loading: updateloading, error:updateError } ] = useMutation(UPDATE_USER_PROFILE);
      console.log(updateloading)
      console.log(updateError)
      const handleUpdate = async (e) => {
          e.preventDefault();
        try {
            const userId = data.user._id
            const variables = {
                userId, // Always required
              };
          
              // Include optional fields only if they have values
              if (calorieGoal) variables.calorieGoal = parseInt(calorieGoal);
              if (password) variables.password = password; 
              if (profilePic) variables.profilePic = profilePic;
              const { data: responseData, updateError } = await updateUserProfile({ variables });
        
            if (updateError) {
                console.error('Mutation error:', updateError);
              }
            setUser(responseData.updateUserProfile);
            navigate('/dashboard');
        } catch (error) {
            setError(error.message);
        }
    };
    
    const handleImageUpload = (e) => {
        setProfilePic(e.target.files[0]);
    };
    
    if (loadingQuery) return <div>Loading...</div>;
  if (loadingError) return <div>Error: {loadingError.message}</div>;

        return (
        <div className="flex flex-col h-dvh">
            <h1 className="text-center">Profile</h1>
            {loadingQuery ? (
                <div>Loading...</div>
            ) : (
                <form onSubmit={handleUpdate} className="flex flex-col m-12 gap-8 space-y-4">
            <h1 className="text-center">Profile </h1>
                   
                        <label htmlFor="calorieGoal" >Calorie Goal</label>
                        <input
                            type="number"
                            id="calorieGoal"
                            name="calorieGoal"
                            placeholder="Calorie Goal"
                            value={calorieGoal}
                            onChange={(e) => setCalorieGoal(e.target.value)}
                            required
                            className="border p-2 rounded"
                        />
                    
                        <label htmlFor="password" >New Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border p-2 rounded"
                        />
                   
                        <label htmlFor="profilePic" className="sr-only">Profile Picture</label>
                        <input
                            type="file"
                            id="profilePic"
                            name="profilePic"
                            onChange={handleImageUpload}
                            className="border p-2 rounded"
                        />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-1/2 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out"
                    >
                        Update Profile
                    </button>
                    {error && <p className="text-red-500">{error}</p>}
                </form>
            )}
        </div>
    );
};

export default Profile;
