// VolunteerDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, PieChart, Pie, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VolunteerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Access volunteer ID from localStorage
    const userString = localStorage.getItem('user'); // Assuming 'user' in localStorage has the volunteer's ID
    const user = userString ? JSON.parse(userString) : null;
    const VOLUNTEER_ID = user?.id; // Safely access user.id

    // Function to fetch dashboard data for the specific volunteer
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!VOLUNTEER_ID) {
                setError('Volunteer ID not found. Please log in as a volunteer.');
                setLoading(false);
                return;
            }
            const url = `${API_BASE_URL}/volunteerdashboard/${VOLUNTEER_ID}`;

            const response = await axios.get(url, {
                headers: {
                    // 'Authorization': `Bearer ${token}` // Add your authentication token if needed
                }
            });
            setDashboardData(response.data);
        } catch (err) {
            console.error('Error fetching volunteer dashboard data:', err);
            setError('Failed to fetch volunteer dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [VOLUNTEER_ID]); // Dependency on VOLUNTEER_ID

    // Effect to fetch data on component mount or when VOLUNTEER_ID changes
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]); // Dependency on fetchDashboardData

    // --- Conditional Rendering for Loading, Error, and No Data States ---
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh',
                fontSize: '24px',
                color: '#333'
            }}>
                Loading your dashboard data...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                margin: '20px',
                padding: '15px',
                backgroundColor: '#ffe0e0',
                border: '1px solid #ff9999',
                color: '#cc0000',
                borderRadius: '5px'
            }}>
                <p>Error: {error}</p>
                <button
                    onClick={fetchDashboardData}
                    style={{
                        padding: '8px 15px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '10px'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div style={{
                margin: '20px',
                padding: '15px',
                backgroundColor: '#e0f7fa',
                border: '1px solid #81d4fa',
                color: '#006064',
                borderRadius: '5px'
            }}>
                <p>No dashboard data available for this volunteer.</p>
            </div>
        );
    }

    // Destructure data from the fetched dashboardData
    const {
        volunteerStats,
        participationHistory,
        volunteerAchievements,
        wasteBreakdown,
        wasteCategoryDistribution,
        wasteInformationCards,
        volunteerWasteCollectionTrend,
    } = dashboardData;

    // --- Chart Data Formatting for Recharts ---
    const barChartColors = ['#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#9C27B0', '#00BCD4'];
    const pieChartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    const formatWasteBreakdownData = wasteBreakdown.map(item => ({ name: item.type, weight: item.weight }));
    const formatWasteCategoryData = wasteCategoryDistribution.map((item, index) => ({
        name: item.category,
        value: item.weight,
        fill: pieChartColors[index % pieChartColors.length]
    }));

    const sortedVolunteerWasteCollectionTrend = [...volunteerWasteCollectionTrend]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(item => ({
            date: item.date ? new Date(item.date).toLocaleDateString('en-GB') : 'N/A Date',
            totalWeight: item.totalWeight.toFixed(2)
        }));

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            backgroundColor: '#f4f7f6',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
                {volunteerStats.name}'s Volunteer Dashboard
            </h1>

            {/* Welcome and Motivation */}
            <div style={{
                backgroundColor: '#e0f7fa',
                padding: '15px 20px',
                borderRadius: '8px',
                marginBottom: '30px',
                textAlign: 'center',
                border: '1px solid #b2ebf2'
            }}>
                <h2 style={{ color: '#00796b', fontSize: '22px', marginBottom: '10px' }}>
                    Thank you for your incredible impact!
                </h2>
                <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.5' }}>
                    You've been a vital part of our mission. Every piece of waste collected, every event attended,
                    contributes to a cleaner, healthier planet. Keep up the amazing work!
                </p>
            </div>

            {/* 1. Top section: Volunteer's Key Stats Cards */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                marginBottom: '40px',
                justifyContent: 'space-around'
            }}>
                {[
                    { label: 'Events Participated', value: volunteerStats.totalEventsParticipated, color: '#007bff' },
                    { label: 'Waste Collected (KG)', value: volunteerStats.totalWasteCollected.toFixed(2), color: '#28a745' },
                    { label: 'Reward Points', value: volunteerStats.rewardPoints, color: '#ffc107' },
                    { label: 'CO2 Offset (KG) (Participated Events)', value: volunteerStats.totalCo2OffsetFromParticipatedEvents.toFixed(2), color: '#17a2b8' }
                ].map((stat, index) => (
                    <div key={index} style={{
                        flex: '1 1 200px',
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>
                            {stat.label}
                        </h3>
                        <p style={{ color: stat.color, fontSize: '32px', fontWeight: 'bold', margin: '0' }}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* 2. Middle section */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
                {/* Part 1: Volunteer's Participation History */}
                <div style={{
                    width: '100%',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    maxHeight: '350px',
                    overflowY: 'auto'
                }}>
                    <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>
                        Your Event Participation History
                    </h2>
                    {participationHistory.length > 0 ? (
                        <ul style={{ listStyleType: 'none', padding: '0' }}>
                            {participationHistory.map((event, index) => (
                                <li key={event._id} style={{
                                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                                    padding: '10px 15px',
                                    marginBottom: '8px',
                                    borderRadius: '5px',
                                    borderLeft: '4px solid #fbc02d',
                                    fontSize: '15px',
                                    color: '#555'
                                }}>
                                    <strong>{event.name}</strong> on {new Date(event.dateOfEvent).toLocaleDateString()} at {event.beachName}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#666' }}>You haven't participated in any events yet. Join one today!</p>
                    )}
                </div>

                {/* Part 2: Waste Breakdown (Volunteer's contribution) & Waste Category Distribution */}
                <div style={{
                    flex: '1 1 48%',
                    minWidth: '300px',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    height: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>
                        Your Waste Breakdown by Type (KG)
                    </h2>
                    {formatWasteBreakdownData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart
                                data={formatWasteBreakdownData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="weight" name="Weight (KG)" fill="#8884d8">
                                    {formatWasteBreakdownData.map((entry, index) => (
                                        <Bar key={`bar-${index}`} fill={barChartColors[index % barChartColors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666' }}>
                            <p>No waste breakdown data available for your contributions.</p>
                        </div>
                    )}
                </div>
                <div style={{
                    flex: '1 1 48%',
                    minWidth: '300px',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    height: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>
                        Your Waste Category Distribution
                    </h2>
                    {formatWasteCategoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <Pie
                                    data={formatWasteCategoryData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toFixed(1)} KG`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666' }}>
                            <p>No waste category distribution data available for your contributions.</p>
                        </div>
                    )}
                </div>

                {/* Part 3: Achievements/Badges */}
                <div style={{
                    width: '100%',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>
                        Your Achievements
                    </h2>
                    {volunteerAchievements.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '15px'
                        }}>
                            {volunteerAchievements.map((achievement, index) => (
                                <div key={index} style={{
                                    border: '1px solid #ffe0b2',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    backgroundColor: '#fff3e0',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    color: '#e65100',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                    🏅 {achievement}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#666' }}>No achievements yet. Keep collecting waste to earn badges!</p>
                    )}
                </div>
            </div>

            {/* 3. Bottom section */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {/* Part 1: Waste Collection Trend (Volunteer's individual trend) */}
                <div style={{
                    flex: '1 1 100%', // Takes full width as this is a single, important chart
                    minWidth: '300px',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    height: '350px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>
                        Your Waste Collection Trend Over Time
                    </h2>
                    {sortedVolunteerWasteCollectionTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height="80%">
                            <LineChart
                                data={sortedVolunteerWasteCollectionTrend}
                                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" interval={0} angle={-30} textAnchor="end" height={60} />
                                <YAxis />
                                <Tooltip labelFormatter={(label) => `Date: ${label}`} />
                                <Legend />
                                <Line type="monotone" dataKey="totalWeight" name="Total Waste Collected (KG)" stroke="#82ca9d" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666' }}>
                            <p>No waste collection trend data available for your contributions.</p>
                        </div>
                    )}
                </div>

                {/* Part 2: Basic Waste Information Cards (re-used for context) */}
                <div style={{
                    width: '100%',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    marginTop: '20px'
                }}>
                    <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>
                        General Waste Information
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px'
                    }}>
                        {[
                            { label: 'Decomposition Time (Sample)', value: wasteInformationCards.decompositionTime, unit: 'days' },
                            { label: 'Carbon Footprint (Sample)', value: wasteInformationCards.carbonFootprint, unit: 'kg CO2/kg' },
                            { label: 'Recyclable (Sample)', value: wasteInformationCards.recyclable !== 'N/A' ? (wasteInformationCards.recyclable ? 'Yes' : 'No') : 'N/A', unit: '' },
                            { label: 'Marine Life Threat Level (Sample)', value: wasteInformationCards.marineLifeThreatLevel, unit: '(1-5)' }
                        ].map((info, index) => (
                            <div key={index} style={{
                                border: '1px solid #ddd',
                                padding: '15px',
                                borderRadius: '8px',
                                backgroundColor: '#f9f9f9',
                                textAlign: 'center'
                            }}>
                                <h4 style={{ color: '#666', fontSize: '15px', marginBottom: '8px' }}>
                                    {info.label}
                                </h4>
                                <p style={{ color: '#333', fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                                    {info.value}{info.value !== 'N/A' && info.unit ? ` ${info.unit}` : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
