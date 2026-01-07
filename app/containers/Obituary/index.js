import React, { Component } from 'react';
import { Heart, Mail, TreePine, User, Calendar, Gift, Flower } from 'lucide-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from '../../actions';

class ObituaryPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            obituaryData: null,
            condolences: [],
            condolenceStats: {
                messages: 0,
                trees: 0,
                flowers: 0,
                gifts: 0
            },
            totalCondolences: 0,
            newCondolence: '',
            loading: true,
            error: null,
            condolenceName: '',
            condolenceEmail: '',
            activeTab: 'obituary',
            griefEmail: ''
        };

        // Bind methods
        this.handlePlantTree = this.handlePlantTree.bind(this);
    }

    componentDidMount() {
        const slug = this.getSlugFromUrl();
        if (slug) {
            this.fetchObituaryData(slug);
        }
    }

    getSlugFromUrl = () => {
        const path = window.location.pathname;
        const parts = path.split('/');
        return parts[parts.length - 1];
    }

    fetchObituaryData = async (slug) => {
        try {
            this.setState({ loading: true, error: null });

            // Fetch obituary details
            const obituaryResponse = await fetch(`http://localhost:3000/api/obituaries/${slug}`);

            if (!obituaryResponse.ok) {
                throw new Error('Obituary not found');
            }

            const obituaryData = await obituaryResponse.json();
            this.setState({ obituaryData });

            // Fetch condolences for this obituary (including tree purchases)
            const condolencesResponse = await fetch(
                `http://localhost:3000/api/condolences/obituary/${obituaryData._id}`
            );

            if (condolencesResponse.ok) {
                const condolencesData = await condolencesResponse.json();

                // Backend returns: { condolences: [...], count: X, stats: {...} }
                this.setState({
                    condolences: condolencesData.condolences || [],
                    totalCondolences: condolencesData.count || 0,
                    condolenceStats: condolencesData.stats || {
                        messages: 0,
                        trees: 0,
                        flowers: 0,
                        gifts: 0
                    }
                });
            }

            this.setState({ loading: false });
        } catch (err) {
            console.error('Error fetching obituary:', err);
            this.setState({
                error: err.message,
                loading: false
            });
        }
    }

    handleInputChange = (field) => (e) => {
        this.setState({ [field]: e.target.value });
    }

    // Navigate to shop with obituary context AND fetch memorial products
    // UPDATE handlePlantTree method in your ObituaryPage component:

    async handlePlantTree() {
        console.log('🔥 PLANT TREE CLICKED!');

        const { obituaryData } = this.state;

        if (!obituaryData || !obituaryData._id) {
            alert('Error: Obituary data not loaded. Please refresh the page.');
            return;
        }

        const obituaryId = obituaryData._id;

        console.log('🌳 Fetching memorial products for obituary:', obituaryId);

        // Fetch memorial products via Redux action
        try {
            await this.props.fetchMemorialProducts(obituaryId, 'tree');
            console.log('✅ Memorial products fetched!');
        } catch (error) {
            console.error('❌ Error:', error);
        }

        // Navigate to shop page (only obituaryId and filter)
        const url = `/shop?obituaryId=${obituaryId}&filter=tree`;

        console.log('🌳 Navigating to:', url);
        window.location.href = url;
    }

    handleSubmitCondolence = async () => {
        const { newCondolence, condolenceName, condolenceEmail, obituaryData } = this.state;

        if (!newCondolence.trim() || !condolenceName.trim()) {
            alert('Please enter your name and message');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/condolences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    obituaryId: obituaryData._id,
                    name: condolenceName,
                    email: condolenceEmail,
                    message: newCondolence,
                    type: 'message'
                }),
            });

            if (response.ok) {
                this.fetchObituaryData(this.getSlugFromUrl());

                this.setState({
                    newCondolence: '',
                    condolenceName: '',
                    condolenceEmail: ''
                });

                alert('Condolence posted successfully! It will be visible after approval.');
            } else {
                alert('Failed to post condolence. Please try again.');
            }
        } catch (error) {
            console.error('Error posting condolence:', error);
            alert('Error posting condolence. Please try again.');
        }
    }

    getCondolenceIcon = (type) => {
        switch (type) {
            case 'tree':
                return <TreePine size={20} className="text-green-600" />;
            case 'flower':
                return <Flower size={20} className="text-pink-600" />;
            case 'gift':
                return <Gift size={20} className="text-purple-600" />;
            default:
                return <Heart size={20} className="text-blue-600" />;
        }
    }

    getBadgeColor = (type) => {
        switch (type) {
            case 'tree':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'flower':
                return 'bg-pink-100 text-pink-800 border-pink-200';
            case 'gift':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    }

    getTypeLabel = (type) => {
        switch (type) {
            case 'tree':
                return 'Planted a Tree';
            case 'flower':
                return 'Sent Flowers';
            case 'gift':
                return 'Sent a Gift';
            default:
                return 'Shared a Memory';
        }
    }

    formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatDateTime = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    }

    render() {
        const {
            obituaryData,
            condolences,
            condolenceStats,
            totalCondolences,
            loading,
            error,
            newCondolence,
            condolenceName,
            condolenceEmail,
            activeTab,
            griefEmail
        } = this.state;

        if (loading) {
            return (
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
                    <div style={{ fontSize: '1.25rem', color: '#4b5563' }}>Loading obituary...</div>
                </div>
            );
        }

        if (error) {
            return (
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#dc2626', marginBottom: '1rem' }}>Error</h2>
                        <p style={{ color: '#4b5563' }}>{error}</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1.5rem',
                                background: '#2563eb',
                                color: 'white',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Go to Homepage
                        </button>
                    </div>
                </div>
            );
        }

        if (!obituaryData) {
            return (
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
                    <div style={{ fontSize: '1.25rem', color: '#4b5563' }}>Obituary not found</div>
                </div>
            );
        }

        const approvedCondolences = condolences.filter(c => c.isApproved);

        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm py-4 px-6">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <h1 className="text-xl font-semibold text-gray-800">West River Funeral Directors LLC</h1>
                        <Link
                            to="/"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            HOME PAGE
                        </Link>
                    </div>
                </header>

                {/* Hero Image */}
                <div className="relative h-80 overflow-hidden">
                    <img
                        src={obituaryData.backgroundImage || 'https://images.unsplash.com/photo-1441260038675-7329ab4cc264?w=1200'}
                        alt="Memorial background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-40"></div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Sidebar */}
                        <div className="lg:col-span-1">
                            {/* Profile Card */}
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden -mt-32 relative z-10">
                                <div className="relative">
                                    <img
                                        src={obituaryData.photo || 'https://via.placeholder.com/400x400?text=No+Photo'}
                                        alt={`${obituaryData.firstName} ${obituaryData.lastName}`}
                                        className="w-full h-80 object-cover"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                                        <h3 className="text-white text-xl font-semibold">
                                            {obituaryData.firstName} {obituaryData.lastName}
                                        </h3>
                                    </div>
                                </div>

                                <div style={{ padding: '24px', position: 'relative', zIndex: 1000 }}>
                                    {/* TEST BUTTON */}
                                    <button
                                        onClick={() => {
                                            alert('TEST BUTTON WORKS!');
                                            console.log('🔥 TEST BUTTON CLICKED!');
                                        }}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#eab308',
                                            color: 'white',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            fontWeight: '500',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            marginBottom: '12px',
                                            display: 'block'
                                        }}
                                    >
                                        🧪 TEST - Click Me First!
                                    </button>

                                    {/* PLANT A TREE BUTTON */}
                                    <button
                                        onClick={this.handlePlantTree}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#15803d',
                                            color: 'white',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            fontWeight: '500',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            marginBottom: '12px',
                                            display: 'block'
                                        }}
                                    >
                                        🌳 Plant a Tree for {obituaryData.firstName}
                                    </button>

                                    {/* SHARE MEMORY BUTTON */}
                                    <button
                                        onClick={() => this.setState({ activeTab: 'tribute' })}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#e5e7eb',
                                            color: '#1f2937',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            fontWeight: '500',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            display: 'block'
                                        }}
                                    >
                                        💬 Share a memory
                                    </button>
                                </div>

                                {/* Memorial Stats */}
                                {(condolenceStats.trees > 0 || condolenceStats.flowers > 0 || condolenceStats.gifts > 0) && (
                                    <div className="px-6 pb-6">
                                        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Memorial Tributes</h4>
                                            <div className="space-y-2">
                                                {condolenceStats.trees > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <TreePine size={16} className="text-green-600" />
                                                            <span className="text-sm text-gray-700">Trees Planted</span>
                                                        </div>
                                                        <span className="font-semibold text-green-700">{condolenceStats.trees}</span>
                                                    </div>
                                                )}
                                                {condolenceStats.flowers > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Flower size={16} className="text-pink-600" />
                                                            <span className="text-sm text-gray-700">Flowers Sent</span>
                                                        </div>
                                                        <span className="font-semibold text-pink-700">{condolenceStats.flowers}</span>
                                                    </div>
                                                )}
                                                {condolenceStats.gifts > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Gift size={16} className="text-purple-600" />
                                                            <span className="text-sm text-gray-700">Gifts Sent</span>
                                                        </div>
                                                        <span className="font-semibold text-purple-700">{condolenceStats.gifts}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Grief Support */}
                            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">Coping with Grief</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    We would like to offer our sincere support to anyone coping with grief.
                                </p>
                                <div className="space-y-3">
                                    <input
                                        type="email"
                                        value={griefEmail}
                                        onChange={this.handleInputChange('griefEmail')}
                                        placeholder="Your Email"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md p-8">
                                <p className="text-sm text-gray-500 mb-2">Official Obituary of</p>
                                <h2 className="text-4xl font-serif text-gray-900 mb-3">
                                    {obituaryData.firstName} {obituaryData.lastName}
                                </h2>
                                <p className="text-lg text-gray-600 mb-6">
                                    {this.formatDate(obituaryData.birthDate)} – {this.formatDate(obituaryData.deathDate)}
                                </p>

                                {/* Tabs */}
                                <div className="flex gap-6 border-b border-gray-200">
                                    <button
                                        onClick={() => this.setState({ activeTab: 'obituary' })}
                                        className={`pb-3 border-b-2 font-medium ${activeTab === 'obituary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
                                    >
                                        Obituary & Services
                                    </button>
                                    <button
                                        onClick={() => this.setState({ activeTab: 'tribute' })}
                                        className={`pb-3 border-b-2 font-medium ${activeTab === 'tribute' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
                                    >
                                        Tribute Wall ({totalCondolences})
                                    </button>
                                </div>

                                {/* Tab Content */}
                                {activeTab === 'obituary' ? (
                                    <div className="mt-8">
                                        <h3 className="text-2xl font-semibold mb-4">{obituaryData.firstName} {obituaryData.lastName} Obituary</h3>
                                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {obituaryData.biography}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-8">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">{totalCondolences}</span> tributes shared
                                            </p>
                                        </div>

                                        {/* Condolences List */}
                                        <div className="space-y-4">
                                            {approvedCondolences.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <p className="text-gray-500">No tributes yet.</p>
                                                </div>
                                            ) : (
                                                approvedCondolences.map((condolence) => (
                                                    <div key={condolence._id} className="bg-white rounded-lg p-6 shadow-sm">
                                                        <div className="flex gap-4">
                                                            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                                                                {condolence.name?.charAt(0).toUpperCase() || 'A'}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold">{condolence.name}</h4>
                                                                {condolence.type !== 'message' && (
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${this.getBadgeColor(condolence.type)}`}>
                                                                        {this.getTypeLabel(condolence.type)}
                                                                    </span>
                                                                )}
                                                                <p className="text-gray-700 mt-2">{condolence.message}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <p className="text-sm">© 2025 West River Funeral Directors LLC. All Rights Reserved.</p>
                    </div>
                </footer>
            </div>
        );
    }
}

// Connect to Redux
const mapStateToProps = (state) => {
    return {
        storeProducts: state.product.storeProducts,
        isLoading: state.product.isLoading
    };
};

export default connect(mapStateToProps, actions)(ObituaryPage);