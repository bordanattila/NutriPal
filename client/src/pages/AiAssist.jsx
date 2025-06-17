import React, { useEffect, useState } from "react";
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/mutations'; // or queries
import Auth from '../utils/auth';
import { DateTime } from 'luxon';
import ky from 'ky';


/**
 * @constant api
 * @description Preconfigured ky instance for making API requests with a set prefix URL.
 */
const api = ky.create({
    prefixUrl: process.env.REACT_APP_API_URL,
});

const AiAssist = () => {
    const [userMessage, setUserMessage] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [remainingMacros, setRemainingMacros] = useState(null);

    const { data, loading: userLoading } = useQuery(GET_USER, {
        context: {
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`,
            },
        },
    });

    const userId = data?.user?._id;
    const macroGoals = data?.user?.macros;

    useEffect(() => {
        const fetchTodaysLog = async () => {
            if (!userId || !macroGoals) return;

            const today = DateTime.now().toFormat('yyyy-MM-dd');
            try {
                const res = await api.get(`api/foodByDate/${userId}/date/${today}`);
                const json = await res.json();
                const foods = json?.foods || [];

                const totals = {
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                };

                foods.forEach((item) => {
                    totals.protein += item.protein || 0;
                    totals.carbs += item.carbohydrate || 0;
                    totals.fat += item.fat || 0;
                });

                setRemainingMacros({
                    protein: Math.max(macroGoals.protein - totals.protein, 0),
                    carbs: Math.max(macroGoals.carbs - totals.carbs, 0),
                    fat: Math.max(macroGoals.fat - totals.fat, 0),
                });
            } catch (err) {
                console.error('Failed to fetch food log:', err);
            }
        };

        fetchTodaysLog();
    }, [userId, macroGoals]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log("Sending macros:", remainingMacros); 
            console.log("macroGoals from user:", macroGoals);
            const response = await api.post('api/ai-assist', {
                json: {
                    message: userMessage,
                    macros: remainingMacros,
                },
            });

            const data = await response.json();
            setAiResponse(data.reply);
            setUserMessage('');
        } catch (err) {
            console.error('Error calling AI endpoint:', err);
            setAiResponse('Sorry, something went wrong.');
        }

        setLoading(false);
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-max p-6">
            <form onSubmit={handleSubmit} className="flex flex-col bg-teal-100 p-4 rounded-md w-full max-w-lg shadow">
                <label htmlFor="ai-prompt" className="text-teal-800 font-semibold mb-2">
                    Ask NutriPal AI
                </label>
                <textarea
                    id="ai-prompt"
                    rows="3"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="What should I eat for lunch to reach my protein goal?"
                    className="p-2 border rounded mb-4 w-full resize-none"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 bg-gradient-to-r from-green-400 to-teal-500 rounded-full shadow-lg hover:from-green-400 hover:to-blue-600 transition duration-300 text-white font-bold py-2 px-6"
                >
                    {loading ? 'Thinking...' : 'Ask AI'}
                </button>
            </form>

            {aiResponse && (
                <div className="mt-6 w-full max-w-lg bg-teal-100 rounded-md p-4 shadow">
                    <h2 className="text-xl font-bold text-teal-700 mb-2 border-b pb-1">AI Response</h2>
                    <p className="text-gray-800 whitespace-pre-line">{aiResponse}</p>
                </div>
            )}
        </div>
    )
}

export default AiAssist;