import React, { Component } from 'react';
import { Heart, Mail, Camera, Video, Flame, MessageSquare, TreePine, User, Gift, Flower } from 'lucide-react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import actions from '../../../actions';

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

        // Bind method
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

        const baseURL = 'https://funeralbackend.onrender.com/';

        fetch(`${baseURL}/api/obituaries/${slug}`)
            .then(obituaryResponse => {
                if (!obituaryResponse.ok) {
                    throw new Error(`Obituary not found (${obituaryResponse.status})`);
                }
                return obituaryResponse.json();
            })
            .then(obituaryData => {
                this.setState({ obituaryData });

                // Fetch condolences
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

    // Navigate to shop with memorial products
    handlePlantTree() {
        console.log('🔥 PLANT TREE CLICKED!');

        const { obituaryData } = this.state;

        if (!obituaryData || !obituaryData._id) {
            alert('Error: Obituary data not loaded. Please refresh the page.');
            return;
        }

        const obituaryId = obituaryData._id;

        console.log('🌳 Fetching memorial products for obituary:', obituaryId);

        // Fetch memorial products via Redux action (using .then instead of await)
        this.props.fetchMemorialProducts(obituaryId, 'tree')
            .then(() => {
                console.log('✅ Memorial products fetched!');

                // Navigate to shop page
                const url = `/shop?obituaryId=${obituaryId}&filter=tree`;
                console.log('🌳 Navigating to:', url);

                window.location.href = url;
            })
            .catch(error => {
                console.error('❌ Error:', error);

                // Still navigate even if fetch fails
                const url = `/shop?obituaryId=${obituaryId}&filter=tree`;
                window.location.href = url;
            });
    }

    handleSubmitCondolence = () => {
        const { newCondolence, condolenceName, condolenceEmail, obituaryData } = this.state;

        if (!newCondolence.trim() || !condolenceName.trim()) {
            alert('Please enter your name and message');
            return;
        }

        fetch('https://funeralbackend.onrender.com/', {
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
                    // Refresh to show new condolence
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
                return { backgroundColor: '#dcfce7', color: '#166534' };
            case 'flower':
                return { backgroundColor: '#fce7f3', color: '#9f1239' };
            case 'gift':
                return { backgroundColor: '#f3e8ff', color: '#6b21a8' };
            default:
                return { backgroundColor: '#dbeafe', color: '#1e40af' };
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
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingText}>Loading obituary...</div>
                </div>
            );
        }

        if (error) {
            return (
                <div style={styles.loadingContainer}>
                    <div style={styles.errorContainer}>
                        <h2 style={styles.errorTitle}>Error</h2>
                        <p style={styles.errorText}>{error}</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={styles.errorButton}
                        >
                            Go to Homepage
                        </button>
                    </div>
                </div>
            );
        }

        if (!obituaryData) {
            return (
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingText}>Obituary not found</div>
                </div>
            );
        }

        const approvedCondolences = condolences.filter(c => c.isApproved);

        return (
            <div style={styles.pageContainer}>
                {/* Header */}
                <header style={styles.header}>
                    <div style={styles.headerContent}>
                        <h1 style={styles.headerTitle}>West River Funeral Directors LLC</h1>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={styles.homeButton}
                        >
                            HOME PAGE
                        </button>
                    </div>
                </header>

                {/* Hero Image */}
                <div style={styles.heroContainer}>
                    <img
                        src={obituaryData.backgroundImage || 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=1400'}
                        alt="Memorial background"
                        style={styles.heroImage}
                    />
                    <div style={styles.heroOverlay}></div>
                </div>

                {/* Main Content */}
                <div style={styles.mainContainer}>
                    <div style={styles.contentGrid}>
                        {/* Left Sidebar */}
                        <div style={styles.sidebar}>
                            <div style={styles.photoCard}>
                                <img
                                    src={obituaryData.photo || 'https://via.placeholder.com/300x300?text=No+Photo'}
                                    alt={`${obituaryData.firstName} ${obituaryData.lastName}`}
                                    style={styles.profilePhoto}
                                />

                                {/* BUTTONS SECTION */}
                                <div style={styles.buttonContainer}>
                                    {/* TEST BUTTON */}
                                    <button
                                        onClick={() => {
                                            alert('TEST BUTTON WORKS!');
                                            console.log('🔥 TEST CLICKED!');
                                        }}
                                        style={{ ...styles.actionButton, backgroundColor: '#eab308' }}
                                    >
                                        🧪 TEST - Click Me!
                                    </button>

                                    {/* PLANT A TREE BUTTON */}
                                    <button
                                        onClick={this.handlePlantTree}
                                        style={styles.treeButton}
                                    >
                                        <TreePine size={18} />
                                        Plant a Tree for {obituaryData.firstName}
                                    </button>

                                    <button
                                        onClick={() => this.setState({ activeTab: 'tribute' })}
                                        style={styles.memoryButton}
                                    >
                                        💬 Share a memory
                                    </button>
                                </div>

                                {/* Memorial Stats */}
                                {(condolenceStats.trees > 0 || condolenceStats.flowers > 0 || condolenceStats.gifts > 0) && (
                                    <div style={{ padding: '0 24px 24px' }}>
                                        <div style={styles.statsCard}>
                                            <h4 style={styles.statsTitle}>Memorial Tributes</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {condolenceStats.trees > 0 && (
                                                    <div style={styles.statRow}>
                                                        <span>🌳 Trees Planted</span>
                                                        <span style={styles.statNumber}>{condolenceStats.trees}</span>
                                                    </div>
                                                )}
                                                {condolenceStats.flowers > 0 && (
                                                    <div style={styles.statRow}>
                                                        <span>🌸 Flowers Sent</span>
                                                        <span style={styles.statNumber}>{condolenceStats.flowers}</span>
                                                    </div>
                                                )}
                                                {condolenceStats.gifts > 0 && (
                                                    <div style={styles.statRow}>
                                                        <span>🎁 Gifts Sent</span>
                                                        <span style={styles.statNumber}>{condolenceStats.gifts}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div style={styles.mainContent}>
                            {/* Obituary Card */}
                            <div style={styles.obituaryCard}>
                                <p style={styles.officialText}>Official Obituary of</p>
                                <h2 style={styles.nameTitle}>
                                    {obituaryData.firstName} {obituaryData.middleName && `${obituaryData.middleName} `}{obituaryData.lastName}
                                </h2>
                                <p style={styles.dateText}>
                                    {new Date(obituaryData.birthDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })} – {new Date(obituaryData.deathDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })} (age {obituaryData.age || 'N/A'})
                                </p>

                                {/* Tabs */}
                                <div style={styles.tabContainer}>
                                    <button
                                        onClick={() => this.setState({ activeTab: 'obituary' })}
                                        style={activeTab === 'obituary' ? styles.activeTab : styles.inactiveTab}
                                    >
                                        Obituary & Services
                                    </button>
                                    <button
                                        onClick={() => this.setState({ activeTab: 'tribute' })}
                                        style={activeTab === 'tribute' ? styles.activeTab : styles.inactiveTab}
                                    >
                                        Tribute Wall ({totalCondolences})
                                    </button>
                                </div>

                                {/* Tab Content */}
                                {activeTab === 'obituary' ? (
                                    <div style={styles.obituaryContent}>
                                        <h3 style={styles.obituarySubtitle}>
                                            {obituaryData.firstName} {obituaryData.lastName} Obituary
                                        </h3>
                                        <div
                                            style={styles.biographyText}
                                            dangerouslySetInnerHTML={{ __html: obituaryData.biography }}
                                        />

                                        <p style={styles.floralText}>
                                            To <span style={styles.redText}>send flowers</span> to the family or{' '}
                                            <span style={styles.redText}>plant a tree</span> in memory of {obituaryData.firstName} {obituaryData.lastName}, please{' '}
                                            <button
                                                onClick={this.handlePlantTree}
                                                style={styles.linkButton}
                                            >
                                                visit our floral store
                                            </button>.
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ marginTop: '32px' }}>
                                        {/* Condolences List */}
                                        <div style={styles.condolencesList}>
                                            {approvedCondolences.length === 0 ? (
                                                <p style={styles.noCondolences}>
                                                    No tributes yet. Be the first to share a memory.
                                                </p>
                                            ) : (
                                                approvedCondolences.map((condolence) => (
                                                    <div key={condolence._id} style={styles.condolenceItem}>
                                                        <div style={styles.condolenceAvatar}>
                                                            {condolence.name?.charAt(0).toUpperCase() || 'A'}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                                <h4 style={styles.condolenceAuthor}>{condolence.name}</h4>
                                                                <span style={styles.condolenceDate}>
                                                                    {new Date(condolence.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>

                                                            {/* Type Badge */}
                                                            {condolence.type !== 'message' && (
                                                                <div style={{
                                                                    ...styles.typeBadge,
                                                                    ...this.getBadgeColor(condolence.type)
                                                                }}>
                                                                    {this.getCondolenceIcon(condolence.type)} {this.getTypeLabel(condolence.type)}
                                                                </div>
                                                            )}

                                                            <p style={styles.condolenceMessage}>{condolence.message}</p>

                                                            {/* Product Details */}
                                                            {condolence.productDetails && (
                                                                <div style={styles.productDetails}>
                                                                    {condolence.productDetails.productName}
                                                                    {condolence.productDetails.quantity > 1 && ` × ${condolence.productDetails.quantity}`}
                                                                    {' • $'}{condolence.productDetails.totalPrice}
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
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer style={styles.footer}>
                    <div style={styles.footerContent}>
                        © 2025 West River Funeral Directors LLC. All Rights Reserved.
                    </div>
                </footer>
            </div>
        );
    }
}

const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f0',
        fontFamily: "'Crimson Text', 'Georgia', serif",
    },
    loadingContainer: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f0',
    },
    loadingText: {
        fontSize: '20px',
        color: '#666',
    },
    errorContainer: {
        textAlign: 'center',
    },
    errorTitle: {
        fontSize: '28px',
        fontWeight: '600',
        color: '#b91c1c',
        marginBottom: '16px',
    },
    errorText: {
        color: '#666',
        fontSize: '16px',
    },
    errorButton: {
        marginTop: '16px',
        padding: '12px 24px',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '15px',
    },
    header: {
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '16px 24px',
    },
    headerContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#1f2937',
        margin: 0,
    },
    homeButton: {
        color: '#2563eb',
        background: 'none',
        border: 'none',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    heroContainer: {
        position: 'relative',
        height: '280px',
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    heroOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.2))',
    },
    mainContainer: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
    },
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 2.5fr',
        gap: '32px',
    },
    sidebar: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    photoCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginTop: '-120px',
        position: 'relative',
        zIndex: 10,
    },
    profilePhoto: {
        width: '100%',
        height: '280px',
        objectFit: 'cover',
    },
    buttonContainer: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    actionButton: {
        width: '100%',
        padding: '14px',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '500',
        fontSize: '15px',
        cursor: 'pointer',
        display: 'block',
        color: 'white',
    },
    treeButton: {
        width: '100%',
        padding: '14px',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '500',
        fontSize: '15px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        backgroundColor: '#15803d',
        color: 'white',
    },
    memoryButton: {
        width: '100%',
        padding: '14px',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '500',
        fontSize: '15px',
        cursor: 'pointer',
        backgroundColor: '#d1d5db',
        color: '#1f2937',
    },
    statsCard: {
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        padding: '16px',
    },
    statsTitle: {
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#166534',
    },
    statRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#374151',
    },
    statNumber: {
        fontWeight: '600',
        color: '#15803d',
    },
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
    },
    obituaryCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '40px',
    },
    officialText: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
    },
    nameTitle: {
        fontSize: '42px',
        fontWeight: '400',
        fontStyle: 'italic',
        color: '#1f2937',
        marginBottom: '12px',
        lineHeight: '1.2',
    },
    dateText: {
        fontSize: '16px',
        color: '#4b5563',
        marginBottom: '24px',
    },
    tabContainer: {
        display: 'flex',
        gap: '16px',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '32px',
    },
    activeTab: {
        padding: '12px 0',
        borderBottom: '2px solid #2563eb',
        color: '#2563eb',
        fontWeight: '500',
        background: 'none',
        border: 'none',
        borderBottom: '2px solid #2563eb',
        cursor: 'pointer',
        fontSize: '15px',
    },
    inactiveTab: {
        padding: '12px 0',
        color: '#6b7280',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '15px',
    },
    obituaryContent: {
        marginBottom: '32px',
    },
    obituarySubtitle: {
        fontSize: '26px',
        fontWeight: '600',
        marginBottom: '20px',
        color: '#1f2937',
    },
    biographyText: {
        fontSize: '17px',
        lineHeight: '1.8',
        color: '#374151',
        marginBottom: '24px',
    },
    floralText: {
        fontSize: '16px',
        color: '#4b5563',
        lineHeight: '1.7',
    },
    redText: {
        color: '#dc2626',
        fontWeight: '500',
    },
    linkButton: {
        color: '#2563eb',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'underline',
        fontSize: '16px',
        padding: 0,
    },
    condolencesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    noCondolences: {
        textAlign: 'center',
        color: '#9ca3af',
        padding: '32px',
        fontSize: '15px',
    },
    condolenceItem: {
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        gap: '16px',
    },
    condolenceAvatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#2563eb',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        fontSize: '20px',
        flexShrink: 0,
    },
    condolenceAuthor: {
        fontWeight: '600',
        color: '#1f2937',
        fontSize: '16px',
        margin: 0,
    },
    condolenceDate: {
        fontSize: '13px',
        color: '#9ca3af',
    },
    typeBadge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '500',
        marginBottom: '8px',
    },
    condolenceMessage: {
        color: '#4b5563',
        lineHeight: '1.7',
        fontSize: '15px',
        margin: 0,
    },
    productDetails: {
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #e5e7eb',
        fontSize: '13px',
        color: '#6b7280',
        fontWeight: '500',
    },
    footer: {
        backgroundColor: '#f3f4f6',
        padding: '24px',
        marginTop: '48px',
    },
    footerContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        textAlign: 'center',
        fontSize: '12px',
        color: '#6b7280',
    },
};

// Connect to Redux
const mapStateToProps = (state) => {
    return {
        storeProducts: state.product.storeProducts,
        isLoading: state.product.isLoading
    };
};

export default connect(mapStateToProps, actions)(withRouter(ObituaryPage));