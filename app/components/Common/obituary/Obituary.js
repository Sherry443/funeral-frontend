import React, { Component } from 'react';
import { Heart, Mail, Camera, Video, Flame, MessageSquare, TreePine, User, Gift, Flower } from 'lucide-react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from '../../../actions';
import './ObituaryPage.css';

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
            activeTab: 'obituary'
        };

        this.handlePlantTree = this.handlePlantTree.bind(this);
    }

    componentDidMount() {
        const { slug } = this.props.match.params;
        if (slug) {
            this.fetchObituaryData(slug);
        }
    }

    componentDidUpdate(prevProps) {
        const { slug } = this.props.match.params;
        if (prevProps.match.params.slug !== slug) {
            this.fetchObituaryData(slug);
        }
    }

    fetchObituaryData = (slug) => {
        this.setState({ loading: true, error: null });

        const baseURL = 'https://funeralbackend.onrender.com';

        fetch(`${baseURL}/api/obituaries/${slug}`)
            .then(obituaryResponse => {
                if (!obituaryResponse.ok) {
                    throw new Error(`Obituary not found (${obituaryResponse.status})`);
                }
                return obituaryResponse.json();
            })
            .then(obituaryData => {
                this.setState({ obituaryData });
                return fetch(`${baseURL}/api/condolences/obituary/${obituaryData._id}`);
            })
            .then(condolencesResponse => {
                if (condolencesResponse.ok) {
                    return condolencesResponse.json();
                }
                throw new Error('No condolences found');
            })
            .then(condolencesData => {
                this.setState({
                    condolences: condolencesData.condolences || [],
                    totalCondolences: condolencesData.count || 0,
                    condolenceStats: condolencesData.stats || {
                        messages: 0,
                        trees: 0,
                        flowers: 0,
                        gifts: 0
                    },
                    loading: false
                });
            })
            .catch(err => {
                console.error('Error fetching obituary:', err);
                this.setState({
                    error: err.message,
                    loading: false
                });
            });
    }

    handlePlantTree() {


        const { obituaryData } = this.state;

        if (!obituaryData || !obituaryData._id) {
            alert('Error: Obituary data not loaded. Please refresh the page.');
            return;
        }

        const obituaryId = obituaryData._id;
        console.log('🌳 Fetching memorial products for obituary:', obituaryId);

        this.props.fetchMemorialProducts(obituaryId, 'tree')
            .then(() => {

                const url = `/shop?obituaryId=${obituaryId}&filter=tree`;

                window.location.href = url;
            })
            .catch(error => {
                console.error('❌ Error:', error);
                const url = `/shop?obituaryId=${obituaryId}&filter=tree`;
                window.location.href = url;
            });
    }

    handleSendFlowers = () => {
        const { obituaryData } = this.state;
        if (!obituaryData || !obituaryData._id) {
            alert('Error: Obituary data not loaded. Please refresh the page.');
            return;
        }
        const url = `/shop?obituaryId=${obituaryData._id}&filter=flower`;
        window.location.href = url;
    }

    handleSubmitCondolence = () => {
        const { newCondolence, condolenceName, condolenceEmail, obituaryData } = this.state;

        if (!newCondolence.trim() || !condolenceName.trim()) {
            alert('Please enter your name and message');
            return;
        }

        fetch('https://funeralbackend.onrender.com/api/condolences', {
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
        })
            .then(response => {
                if (response.ok) {
                    const { slug } = this.props.match.params;
                    this.fetchObituaryData(slug);

                    this.setState({
                        newCondolence: '',
                        condolenceName: '',
                        condolenceEmail: ''
                    });

                    alert('Condolence posted successfully!');
                } else {
                    alert('Failed to post condolence. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error posting condolence:', error);
                alert('Error posting condolence. Please try again.');
            });
    }

    handleInputChange = (field, value) => {
        this.setState({ [field]: value });
    }

    getCondolenceIcon = (type) => {
        switch (type) {
            case 'tree':
                return '🌳';
            case 'flower':
                return '🌸';
            case 'gift':
                return '🎁';
            default:
                return '💭';
        }
    }

    getBadgeColor = (type) => {
        switch (type) {
            case 'tree':
                return 'badge-tree';
            case 'flower':
                return 'badge-flower';
            case 'gift':
                return 'badge-gift';
            default:
                return 'badge-message';
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

    render() {
        const {
            obituaryData,
            condolences,
            condolenceStats,
            totalCondolences,
            newCondolence,
            loading,
            error,
            condolenceName,
            condolenceEmail,
            activeTab
        } = this.state;

        if (loading) {
            return (
                <div className="loading-container">
                    <div className="loading-text">Loading obituary...</div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="loading-container">
                    <div className="error-container">
                        <h2 className="error-title">Error</h2>
                        <p className="error-text">{error}</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="error-button"
                        >
                            Go to Homepage
                        </button>
                    </div>
                </div>
            );
        }

        if (!obituaryData) {
            return (
                <div className="loading-container">
                    <div className="loading-text">Obituary not found</div>
                </div>
            );
        }

        const approvedCondolences = condolences.filter(c => c.isApproved);

        return (
            <div className="obituary-page">
                {/* Header */}
                <header className="obituary-header">
                    <div className="header-content">
                        <h1 className="header-title">West River Funeral Directors LLC</h1>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="home-button"
                        >
                            HOME PAGE
                        </button>
                    </div>
                </header>

                {/* Hero Image */}
                <div className="hero-section">
                    <img
                        src={obituaryData.backgroundImage || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600'}
                        alt="Memorial background"
                        className="hero-image"
                    />
                    <div className="hero-overlay"></div>
                </div>

                {/* Main Content */}
                <div className="main-container">
                    <div className="content-grid">
                        {/* Left Sidebar */}
                        <aside className="sidebar">
                            <div className="photo-card">
                                <div className="profile-photo-wrapper">
                                    <img
                                        src={obituaryData.photo || 'https://via.placeholder.com/300x400?text=No+Photo'}
                                        alt={`${obituaryData.firstName} ${obituaryData.lastName}`}
                                        className="profile-photo"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="button-container">
                                    <button
                                        onClick={this.handleSendFlowers}
                                        className="btns btn-sympathy"
                                    >
                                        Send Sympathy Gifts
                                    </button>

                                    <button
                                        onClick={this.handlePlantTree}
                                        className="btns btn-tree"
                                    >
                                        <TreePine size={18} />
                                        Plant a Tree for {obituaryData.firstName}
                                    </button>

                                    <button
                                        onClick={() => this.setState({ activeTab: 'tribute' })}
                                        className="btns btn-memory"
                                    >
                                        Share a memory
                                    </button>
                                </div>

                                {/* Grief Support Section */}
                                <div className="grief-support-section">
                                    <h3 className="grief-support-title">Coping with Grief</h3>
                                    <p className="grief-support-text">
                                        We would like to offer our sincere support to anyone coping with grief. Enter your email
                                        below to receive a daily grief support messages. Messages run for up to one year and
                                        you can stop at any time. Your email will not be used for any other purpose.
                                    </p>
                                    <input
                                        type="email"
                                        placeholder="Your Email"
                                        className="grief-email-input"
                                    />
                                </div>

                                {/* Memorial Stats */}
                                {(condolenceStats.trees > 0 || condolenceStats.flowers > 0 || condolenceStats.gifts > 0) && (
                                    <div className="stats-section">
                                        <div className="stats-card">
                                            <h4 className="stats-title">Memorial Tributes</h4>
                                            <div className="stats-list">
                                                {condolenceStats.trees > 0 && (
                                                    <div className="stat-row">
                                                        <span> Trees Planted</span>
                                                        <span className="stat-number">{condolenceStats.trees}</span>
                                                    </div>
                                                )}
                                                {condolenceStats.flowers > 0 && (
                                                    <div className="stat-row">
                                                        <span>🌸 Flowers Sent</span>
                                                        <span className="stat-number">{condolenceStats.flowers}</span>
                                                    </div>
                                                )}
                                                {condolenceStats.gifts > 0 && (
                                                    <div className="stat-row">
                                                        <span>🎁 Gifts Sent</span>
                                                        <span className="stat-number">{condolenceStats.gifts}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <main className="main-content">
                            <div className="obituary-card">
                                <p className="official-text">Official Obituary of</p>
                                <h2 className="name-title">
                                    {obituaryData.firstName} {obituaryData.middleName && `${obituaryData.middleName} `}{obituaryData.lastName}
                                </h2>
                                <p className="date-text">
                                    {new Date(obituaryData.birthDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })} - {new Date(obituaryData.deathDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })} (age {obituaryData.age || 'N/A'})
                                </p>

                                {/* Tabs */}
                                <div className="tab-container">
                                    <button
                                        onClick={() => this.setState({ activeTab: 'obituary' })}
                                        className={activeTab === 'obituary' ? 'tab-button active' : 'tab-button'}
                                    >
                                        Obituary & Services
                                    </button>
                                    <button
                                        onClick={() => this.setState({ activeTab: 'tribute' })}
                                        className={activeTab === 'tribute' ? 'tab-button active' : 'tab-button'}
                                    >
                                        Tribute Wall
                                    </button>
                                </div>

                                {/* Tab Content */}
                                {activeTab === 'obituary' ? (
                                    <div className="obituary-content">
                                        <h3 className="obituary-subtitle">
                                            {obituaryData.firstName} {obituaryData.lastName} Obituary
                                        </h3>

                                        {/* Obituary Photo */}
                                        {obituaryData.contentImage && (
                                            <div className="content-image-wrapper">
                                                <img
                                                    src={obituaryData.contentImage}
                                                    alt={`${obituaryData.firstName} ${obituaryData.lastName}`}
                                                    className="content-image"
                                                />
                                            </div>
                                        )}

                                        <div
                                            className="biography-text"
                                            dangerouslySetInnerHTML={{ __html: obituaryData.biography }}
                                        />

                                        <p className="floral-text">
                                            To <span className="red-text">send flowers</span> to the family or{' '}
                                            <span className="red-text">plant a tree</span> in memory of {obituaryData.firstName} {obituaryData.lastName}, please{' '}
                                            <button
                                                onClick={this.handlePlantTree}
                                                className="link-button"
                                            >
                                                visit our floral store
                                            </button>.
                                        </p>

                                        {/* Services Section */}
                                        <div className="services-section">
                                            <h3 className="services-title">Services</h3>
                                            <p className="services-text">
                                                You can call show your support by sending flowers directly to the family, or by planting a memorial tree in the memory of {obituaryData.firstName} {obituaryData.lastName}
                                            </p>
                                            <button
                                                onClick={this.handlePlantTree}
                                                className="btns btn-tree-full"
                                            >
                                                <TreePine size={18} />
                                                Plant a tree in memory of {obituaryData.firstName}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="tribute-content">
                                        {/* Tribute Wall Header */}
                                        <div className="tribute-header">
                                            <h3 className="tribute-title">Tribute Wall</h3>
                                            <span className="tribute-count">{totalCondolences} posts</span>
                                        </div>

                                        {/* Tree Planting Banner */}
                                        {condolenceStats.trees > 0 && (
                                            <div className="tree-banner">
                                                <div className="tree-banner-content">
                                                    <TreePine size={24} className="tree-icon" />
                                                    <span>{condolenceStats.trees} tree{condolenceStats.trees > 1 ? 's' : ''} planted in memory of {obituaryData.firstName}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Add Tribute Form */}
                                        <div className="add-tribute-form">
                                            <textarea
                                                placeholder="Please share your remembrances and condolences"
                                                value={newCondolence}
                                                onChange={(e) => this.handleInputChange('newCondolence', e.target.value)}
                                                className="tribute-textarea"
                                                rows="4"
                                            />

                                            <div className="tribute-actions">
                                                <div className="tribute-action-buttons">
                                                    <button className="tribute-action-btn">
                                                        <Camera size={18} /> Photos
                                                    </button>
                                                    <button className="tribute-action-btn">
                                                        <Video size={18} /> Video
                                                    </button>
                                                    <button className="tribute-action-btn">
                                                        <Flame size={18} /> Candle
                                                    </button>
                                                    <button className="tribute-action-btn">
                                                        <MessageSquare size={18} /> Sentiment
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Plant Tree CTA */}
                                        <div className="plant-tree-cta">
                                            <div className="plant-tree-cta-content">
                                                <div className="plant-tree-cta-text">
                                                    <h4>Plant a tree in memory of {obituaryData.firstName}</h4>
                                                    <p>An environmentally-friendly option</p>
                                                </div>
                                                <button
                                                    onClick={this.handlePlantTree}
                                                    className="btns btn-tree-cta"
                                                >
                                                    Plant a tree
                                                </button>
                                            </div>
                                        </div>

                                        {/* Condolences List */}
                                        <div className="condolences-list">
                                            {approvedCondolences.length === 0 ? (
                                                <p className="no-condolences">
                                                    No tributes yet. Be the first to share a memory.
                                                </p>
                                            ) : (
                                                approvedCondolences.map((condolence) => (
                                                    <div key={condolence._id} className="condolence-item">
                                                        <div className="condolence-avatar">
                                                            {condolence.name?.charAt(0).toUpperCase() || 'A'}
                                                        </div>
                                                        <div className="condolence-content">
                                                            <div className="condolence-header">
                                                                <h4 className="condolence-author">{condolence.name}</h4>
                                                                <span className="condolence-date">
                                                                    {new Date(condolence.createdAt).toLocaleDateString('en-US', {
                                                                        month: 'long',
                                                                        day: 'numeric',
                                                                        year: 'numeric'
                                                                    })} • {new Date(condolence.createdAt).toLocaleTimeString('en-US', {
                                                                        hour: 'numeric',
                                                                        minute: '2-digit',
                                                                        hour12: true
                                                                    })}
                                                                </span>
                                                            </div>

                                                            {/* Type Badge */}
                                                            {condolence.type !== 'message' && (
                                                                <div className={`type-badge ${this.getBadgeColor(condolence.type)}`}>
                                                                    {this.getCondolenceIcon(condolence.type)} {this.getTypeLabel(condolence.type)}
                                                                </div>
                                                            )}

                                                            <p className="condolence-message">{condolence.message}</p>

                                                            {/* Product Details */}
                                                            {condolence.productDetails && (
                                                                <div className="product-details">
                                                                    {condolence.productDetails.productName}
                                                                    {condolence.productDetails.quantity > 1 && ` × ${condolence.productDetails.quantity}`}
                                                                    {' • $'}{condolence.productDetails.totalPrice}
                                                                </div>
                                                            )}

                                                            {/* Tree Visual for Tree Type */}
                                                            {condolence.type === 'tree' && (
                                                                <div className="tree-visual">
                                                                    <TreePine size={40} className="tree-visual-icon" />
                                                                    <div className="tree-visual-text">
                                                                        <strong>A Memorial tree was planted for {obituaryData.firstName}</strong>
                                                                        <p className="tree-visual-subtext">
                                                                            We are deeply sorry for your loss ~ the staff at West River Funeral Directors LLC
                                                                        </p>
                                                                        <a href="#" className="tree-visual-link">Join in honoring their life - plant a memorial tree</a>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        storeProducts: state.product.storeProducts,
        isLoading: state.product.isLoading
    };
};

export default connect(mapStateToProps, actions)(withRouter(ObituaryPage));