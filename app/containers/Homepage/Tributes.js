import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const Tributes = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // Dummy data - replace with API data later
    const tributes = [
        {
            id: 1,
            name: "DR. DEBRA PAXTON",
            date: "Dec 20, 2025",
            location: "Rapid City",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
        },
        {
            id: 2,
            name: "STEVEN KENDALL",
            date: "Dec 13, 2025",
            location: "Rapid City",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        },
        {
            id: 3,
            name: "VICKIE BROWN",
            date: "Dec 6, 2025",
            location: "Rapid City",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop"
        },
        {
            id: 4,
            name: "ANDREW CHADO",
            date: "Dec 4, 2025",
            location: "Rapid City",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
        },
        {
            id: 5,
            name: "KELLY DENNY",
            date: "Nov 3, 2025",
            location: "Lead",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop"
        },
        {
            id: 6,
            name: "ROBERT EGGERS",
            date: "Oct 29, 2025",
            location: "Quinn",
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
        },
        {
            id: 7,
            name: "MARY JOHNSON",
            date: "Oct 15, 2025",
            location: "Sioux Falls",
            image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop"
        },
        {
            id: 8,
            name: "JAMES PETERSON",
            date: "Oct 8, 2025",
            location: "Aberdeen",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
        }
    ];

    const itemsPerPage = 6;
    const maxIndex = Math.max(0, tributes.length - itemsPerPage);

    const handlePrevious = () => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    };

    const visibleTributes = tributes.slice(currentIndex, currentIndex + itemsPerPage);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-serif">Recent Tributes</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Obituary search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-4 pr-10 py-2 border border-gray-300 rounded-full w-72 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
            </div>

            {/* Carousel */}
            <div className="relative">
                {/* Navigation Buttons */}
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg rounded-full p-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>

                <button
                    onClick={handleNext}
                    disabled={currentIndex >= maxIndex}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg rounded-full p-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>

                {/* Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {visibleTributes.map((tribute) => (
                        <div
                            key={tribute.id}
                            className="flex flex-col items-center text-center cursor-pointer hover:opacity-80 transition"
                        >
                            <div className="w-full aspect-square rounded-lg overflow-hidden mb-3 shadow-md">
                                <img
                                    src={tribute.image}
                                    alt={tribute.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-wide mb-1">
                                {tribute.name}
                            </h3>
                            <p className="text-xs text-gray-600 mb-0.5">{tribute.date}</p>
                            <p className="text-xs text-gray-500">{tribute.location}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8">
                <button className="px-6 py-2 border-2 border-gray-800 text-gray-800 rounded-full uppercase text-sm font-semibold hover:bg-gray-800 hover:text-white transition">
                    View All Tributes
                </button>
                <button className="px-6 py-2 border-2 border-gray-800 text-gray-800 rounded-full uppercase text-sm font-semibold hover:bg-gray-800 hover:text-white transition">
                    Join Obituary Alerts
                </button>
            </div>
        </div>
    );
};

export default Tributes;