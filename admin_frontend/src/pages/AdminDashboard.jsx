// AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, PieChart, Pie, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define cost assumptions (you can adjust these values)
const COST_PER_PAIR_GLOVES = 20; // INR
const COST_PER_WASTE_BAG = 5;   // INR
const COST_PER_VOLUNTEER_REFRESHMENT = 50; // INR per volunteer for refreshment


const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState(null);

    // Access organizer ID from localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const ORGANIZER_ID = user?.id; // Safely access user.id

    // Function to fetch dashboard data, memoized for efficiency
    const fetchDashboardData = useCallback(async (eventId = null) => {
        setLoading(true);
        setError(null);
        try {
            const url = eventId
                ? `${API_BASE_URL}/admindashboard/event/${eventId}`
                : `${API_BASE_URL}/admindashboard/overall/${ORGANIZER_ID}`;

            const response = await axios.get(url, {
                headers: {
                    // 'Authorization': `Bearer ${token}` // Add your authentication token if needed
                }
            });
            setDashboardData(response.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to fetch dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [ORGANIZER_ID]); // Re-create if ORGANIZER_ID changes

    // Effect to fetch data on component mount or when selectedEventId/ORGANIZER_ID changes
    useEffect(() => {
        if (ORGANIZER_ID) {
            fetchDashboardData(selectedEventId);
        } else {
            setError('Organizer ID not found. Please log in again.');
            setLoading(false);
        }
    }, [ORGANIZER_ID, selectedEventId, fetchDashboardData]); // Dependencies for useEffect

    // Handler for selecting a specific event from the list
    const handleSelectEvent = (eventId) => {
        setSelectedEventId(eventId);
    };

    // Handler for reverting to showing all events data
    const handleShowAllEvents = () => {
        setSelectedEventId(null);
    };

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
                Loading dashboard data...
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
                    onClick={() => fetchDashboardData(selectedEventId)}
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
                <p>No dashboard data available.</p>
            </div>
        );
    }

    // Destructure data from the fetched dashboardData
    const {
        overallStats,
        eventList,
        wasteBreakdown,
        wasteCategoryDistribution,
        wasteInformationCards,
        topContributors,
        eventTimeline,
        wasteCollectionTrend,
    } = dashboardData;

    // --- Chart Data Formatting for Recharts ---

    // Bar Chart (Waste Breakdown by Type)
    const formatWasteBreakdownData = wasteBreakdown.map(item => ({ name: item.type, weight: item.weight }));
    const barChartColors = ['#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#9C27B0', '#00BCD4']; // Example colors

    // Pie Chart (Waste Category Distribution)
    const pieChartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']; // Example colors
    const formatWasteCategoryData = wasteCategoryDistribution.map((item, index) => ({
        name: item.category,
        value: item.weight,
        fill: pieChartColors[index % pieChartColors.length] // Assign color directly for Pie
    }));

    // Line Graph (Event Timeline & Volunteer Registration Trend)
    const sortedEventTimeline = [...eventTimeline].sort((a, b) => new Date(a.dateOfEvent) - new Date(b.dateOfEvent))
        .map(item => ({
            date: new Date(item.dateOfEvent).toLocaleDateString('en-GB'), // Format date for display
            volunteerCount: item.volunteerRegisterCount,
            eventName: item.eventName // Keep event name for tooltip
        }));

    // Line Graph (Waste Collection Trend)
    const sortedWasteCollectionTrend = [...wasteCollectionTrend].sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(item => ({
            date: item.date ? new Date(item.date).toLocaleDateString('en-GB') : 'N/A Date',
            totalWeight: item.totalWeight.toFixed(2)
        }));

    // --- Specific Event Logistics & Cost Estimation ---
    let estimatedEquipmentCost = 0;
    let estimatedRefreshmentCost = 0;
    let totalEstimatedEventCost = 0;

    const currentEvent = selectedEventId ? eventList.find(e => e._id === selectedEventId) : null;

    if (currentEvent) {
        const volunteersRegistered = currentEvent.volunteerRegisterCount || 0;
        // Estimate equipment based on volunteer count (e.g., 1 pair of gloves, 2 bags per volunteer)
        estimatedEquipmentCost = (volunteersRegistered * COST_PER_PAIR_GLOVES) + (volunteersRegistered * 2 * COST_PER_WASTE_BAG);
        
        // Estimate refreshment cost if enabled
        if (currentEvent.refreshments) {
            estimatedRefreshmentCost = volunteersRegistered * COST_PER_VOLUNTEER_REFRESHMENT;
        }

        totalEstimatedEventCost = estimatedEquipmentCost + estimatedRefreshmentCost;
    }


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
                Organizer Dashboard
            </h1>

            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <button
                    onClick={handleShowAllEvents}
                    disabled={selectedEventId === null}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: selectedEventId === null ? '#cccccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: selectedEventId === null ? 'not-allowed' : 'pointer',
                        marginRight: '10px',
                        fontSize: '16px'
                    }}
                >
                    Show All Events Data
                </button>
                {selectedEventId && (
                    <span style={{
                        padding: '10px 20px',
                        backgroundColor: '#f0f0f0',
                        color: '#333',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '16px'
                    }}>
                        Currently Viewing: {currentEvent?.name || 'Selected Event'}
                    </span>
                )}
            </div>

            {/* 1. Top section: Overall Stats Cards */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                marginBottom: '40px',
                justifyContent: 'space-around'
            }}>
                {[
                    { label: 'Total Events', value: overallStats.totalEvents, color: '#007bff' },
                    { label: 'Volunteers Registered', value: overallStats.totalVolunteerRegistered, color: '#28a745' },
                    { label: 'Total Waste Collected (KG)', value: overallStats.totalWasteCollected.toFixed(2), color: '#ffc107' },
                    { label: 'Total CO2 Offset (KG)', value: overallStats.totalCo2Offset.toFixed(2), color: '#17a2b8' }
                ].map((stat, index) => (
                    <div key={index} style={{
                        flex: '1 1 200px', // Allows cards to grow/shrink, minimum 200px width
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
                {/* Part 1: Events List (Horizontal Scroll) */}
                <div style={{
                    width: '100%',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>
                        Events List
                    </h2>
                    <div style={{
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        paddingBottom: '10px',
                        display: 'flex', // Use flex for chips
                        gap: '10px' // Space between chips
                    }}>
                        {eventList.length > 0 ? (
                            eventList.map((event) => (
                                <span
                                    key={event._id}
                                    onClick={() => handleSelectEvent(event._id)}
                                    style={{
                                        display: 'inline-block',
                                        backgroundColor: selectedEventId === event._id ? '#007bff' : '#e0e0e0',
                                        color: selectedEventId === event._id ? 'white' : '#333',
                                        padding: '8px 15px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        border: selectedEventId === event._id ? '1px solid #0056b3' : '1px solid #bbb',
                                        whiteSpace: 'nowrap',
                                        transition: 'background-color 0.3s ease'
                                    }}
                                >
                                    {event.name} ({new Date(event.dateOfEvent).toLocaleDateString()})
                                </span>
                            ))
                        ) : (
                            <p style={{ color: '#666' }}>No events found.</p>
                        )}
                    </div>
                </div>

                {/* Event Logistics & Estimated Costs (Only visible for specific event) */}
                {selectedEventId && currentEvent && (
                    <div style={{
                        width: '100%',
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        marginTop: '20px'
                    }}>
                        <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>
                            Event Logistics & Estimated Costs
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '15px'
                        }}>
                            <div style={{
                                border: '1px solid #b3e5fc',
                                padding: '15px',
                                borderRadius: '8px',
                                backgroundColor: '#e1f5fe',
                                textAlign: 'center'
                            }}>
                                <h4 style={{ color: '#0288d1', fontSize: '15px', marginBottom: '8px' }}>
                                    Volunteers Registered
                                </h4>
                                <p style={{ color: '#0288d1', fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                                    {currentEvent.volunteerRegisterCount || 0}
                                </p>
                            </div>
                            <div style={{
                                border: '1px solid #c8e6c9',
                                padding: '15px',
                                borderRadius: '8px',
                                backgroundColor: '#e8f5e9',
                                textAlign: 'center'
                            }}>
                                <h4 style={{ color: '#388e3c', fontSize: '15px', marginBottom: '8px' }}>
                                    Refreshments Provided
                                </h4>
                                <p style={{ color: '#388e3c', fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                                    {currentEvent.refreshments ? 'Yes' : 'No'}
                                </p>
                            </div>
                            <div style={{
                                border: '1px solid #ffccbc',
                                padding: '15px',
                                borderRadius: '8px',
                                backgroundColor: '#ffe0b2',
                                textAlign: 'center'
                            }}>
                                <h4 style={{ color: '#f4511e', fontSize: '15px', marginBottom: '8px' }}>
                                    Estimated Equipment Cost
                                </h4>
                                <p style={{ color: '#f4511e', fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                                    ₹ {estimatedEquipmentCost.toFixed(2)}
                                </p>
                            </div>
                            <div style={{
                                border: '1px solid #ffcdd2',
                                padding: '15px',
                                borderRadius: '8px',
                                backgroundColor: '#ffebee',
                                textAlign: 'center'
                            }}>
                                <h4 style={{ color: '#d32f2f', fontSize: '15px', marginBottom: '8px' }}>
                                    Estimated Refreshment Cost
                                </h4>
                                <p style={{ color: '#d32f2f', fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                                    ₹ {estimatedRefreshmentCost.toFixed(2)}
                                </p>
                            </div>
                            <div style={{
                                border: '1px solid #c5cae9',
                                padding: '15px',
                                borderRadius: '8px',
                                backgroundColor: '#e8eaf6',
                                textAlign: 'center',
                                gridColumn: 'span 2 / auto' // Span two columns on wider screens
                            }}>
                                <h4 style={{ color: '#3f51b5', fontSize: '18px', marginBottom: '8px' }}>
                                    Total Estimated Event Cost
                                </h4>
                                <p style={{ color: '#3f51b5', fontSize: '36px', fontWeight: 'bold', margin: '0' }}>
                                    ₹ {totalEstimatedEventCost.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}


                {/* Part 2: Detail Waste Breakdown (Bar graph) & Pie chart (Category distribution) */}
                <div style={{
                    flex: '1 1 48%', // Approx 50% width with gap
                    minWidth: '300px', // Ensure it doesn't get too small on mobile
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    height: '400px', // Fixed height for charts
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>
                        Waste Breakdown by Type (KG)
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
                            <p>No waste breakdown data available.</p>
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
                        Waste Category Distribution
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
                            <p>No waste category distribution data available.</p>
                        </div>
                    )}
                </div>

                {/* Part 3: 2x2 cards for Waste Information */}
                <div style={{
                    width: '100%', // Takes full width below charts
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>
                        Waste Information
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', // Responsive grid
                        gap: '15px'
                    }}>
                        {[
                            { label: 'Decomposition Time', value: wasteInformationCards.decompositionTime, unit: 'days' },
                            { label: 'Carbon Footprint', value: wasteInformationCards.carbonFootprint, unit: 'kg CO2/kg' },
                            { label: 'Recyclable', value: wasteInformationCards.recyclable !== 'N/A' ? (wasteInformationCards.recyclable ? 'Yes' : 'No') : 'N/A', unit: '' },
                            { label: 'Marine Life Threat Level', value: wasteInformationCards.marineLifeThreatLevel, unit: '(1-5)' }
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

            {/* 3. Bottom section */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {/* Part 1: Top 3 contributors */}
                <div style={{
                    flex: '1 1 48%',
                    minWidth: '300px',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    height: '350px' // Fixed height for consistency
                }}>
                    <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>
                        Top 3 Waste Contributors
                    </h2>
                    {topContributors.length > 0 ? (
                        <ol style={{ listStyleType: 'none', padding: '0' }}>
                            {topContributors.map((contributor, index) => (
                                <li key={index} style={{
                                    backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#ffffff',
                                    padding: '10px 15px',
                                    marginBottom: '8px',
                                    borderRadius: '5px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderLeft: '4px solid #007bff'
                                }}>
                                    <span style={{ fontWeight: 'bold', color: '#555' }}>
                                        {index + 1}. {contributor.volunteerName}
                                    </span>
                                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                                        {contributor.totalWasteCollected.toFixed(2)} KG
                                    </span>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%', color: '#666' }}>
                            <p>No top contributors data available.</p>
                        </div>
                    )}
                </div>

                {/* Part 2: Line graphs */}
                <div style={{
                    flex: '1 1 48%',
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
                        Event Timeline & Volunteer Registration Trend
                    </h2>
                    {sortedEventTimeline.length > 0 ? (
                        <ResponsiveContainer width="100%" height="80%">
                            <LineChart
                                data={sortedEventTimeline}
                                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" interval={0} angle={-30} textAnchor="end" height={60} />
                                <YAxis />
                                <Tooltip labelFormatter={(label) => `Date: ${label}`} />
                                <Legend />
                                <Line type="monotone" dataKey="volunteerCount" name="Volunteers Registered" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666' }}>
                            <p>No event timeline data available.</p>
                        </div>
                    )}
                </div>

                <div style={{
                    width: '100%',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    height: '350px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '20px' // Space from the above elements
                }}>
                    <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>
                        Waste Collection Trend
                    </h2>
                    {sortedWasteCollectionTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height="80%">
                            <LineChart
                                data={sortedWasteCollectionTrend}
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
                            <p>No waste collection trend data available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
