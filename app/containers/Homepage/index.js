import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

import actions from '../../actions';
import banners from './banners.json';
import CarouselSlider from '../../components/Common/CarouselSlider';
import { responsiveOneItemCarousel } from '../../components/Common/CarouselSlider/utils';

import './Home.css';

class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
      searchQuery: '',
      tributes: [],
      loading: true,
      error: null
    };
  }

  // Component mount hone par tributes fetch karo
  componentDidMount() {
    this.fetchRecentTributes();
  }

  // MongoDB se recent tributes fetch karne ka function
  fetchRecentTributes = async () => {
    try {
      this.setState({ loading: true, error: null });

      // API call to fetch recent obituaries
      const response = await fetch('http://localhost:3000/api/obituaries/recent', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tributes');
      }

      const data = await response.json();

      // Transform data to match component structure
      const formattedTributes = data.map(obituary => ({
        id: obituary._id,
        name: `${obituary.firstName} ${obituary.lastName}`.toUpperCase(),
        date: this.formatDate(obituary.deathDate),
        location: obituary.location || 'Unknown',
        image: obituary.photo || 'https://via.placeholder.com/400x400?text=No+Image',
        // Store full obituary data for routing
        slug: obituary.slug || obituary._id
      }));

      this.setState({
        tributes: formattedTributes,
        loading: false
      });

    } catch (error) {
      console.error('Error fetching tributes:', error);
      this.setState({
        error: error.message,
        loading: false
      });
    }
  };

  // Date formatting function
  formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  handlePrevious = () => {
    this.setState(prevState => ({
      currentIndex: Math.max(0, prevState.currentIndex - 1)
    }));
  };

  handleNext = () => {
    const itemsPerPage = 6;
    const maxIndex = Math.max(0, this.state.tributes.length - itemsPerPage);
    this.setState(prevState => ({
      currentIndex: Math.min(maxIndex, prevState.currentIndex + 1)
    }));
  };

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value });
  };

  // Search functionality
  handleSearch = async () => {
    const { searchQuery } = this.state;
    if (!searchQuery.trim()) {
      this.fetchRecentTributes();
      return;
    }

    try {
      this.setState({ loading: true });

      const response = await fetch(`/api/obituaries/search?q=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();

      const formattedTributes = data.map(obituary => ({
        id: obituary._id,
        name: `${obituary.firstName} ${obituary.lastName}`.toUpperCase(),
        date: this.formatDate(obituary.deathDate),
        location: obituary.location || 'Unknown',
        image: obituary.photo || 'https://via.placeholder.com/400x400?text=No+Image',
        slug: obituary.slug || obituary._id
      }));

      this.setState({
        tributes: formattedTributes,
        loading: false,
        currentIndex: 0
      });

    } catch (error) {
      console.error('Error searching tributes:', error);
      this.setState({ loading: false });
    }
  };

  // Handle Enter key in search
  handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleSearch();
    }
  };

  render() {
    const { currentIndex, searchQuery, tributes, loading, error } = this.state;
    const itemsPerPage = 6;
    const maxIndex = Math.max(0, tributes.length - itemsPerPage);
    const visibleTributes = tributes.slice(currentIndex, currentIndex + itemsPerPage);

    return (
      <div className='homepage'>
        {/* Hero Banner Carousel */}
        <div className='hero-banner-section'>
          <CarouselSlider
            swipeable={true}
            showDots={true}
            infinite={true}
            autoPlay={true}
            autoPlaySpeed={5000}
            slides={banners}
            responsive={responsiveOneItemCarousel}
          >
            {banners.map((item, index) => (
              <div key={index} className='hero-slide'>
                <div
                  className='hero-slide-bg'
                  style={{
                    backgroundImage: `url(${item.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '600px',
                    position: 'relative'
                  }}
                >
                  <div className='hero-overlay'></div>
                  <div className='hero-content'>
                    <div className='hero-text-wrapper'>
                      {item.title && (
                        <h1 className='hero-title'>{item.title}</h1>
                      )}
                      {item.content && (
                        <div
                          className='hero-description'
                          dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                      )}
                      {item.buttonText && (
                        <Link to={item.link || '/shop'}>
                          <Button className='hero-cta-button'>
                            {item.buttonText}
                            <i className='fa fa-chevron-right ml-2'></i>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CarouselSlider>
        </div>

        {/* Recent Tributes Section */}
        <Container style={{ maxWidth: '90vw', width: '90vw', marginTop: '2rem' }}>
          {/* Header */}
          <Row className="tributes-header mb-4 pb-3 border-bottom">
            <Col md={6} className="d-flex align-items-center">
              <h1 className="tributes-title mb-0">Recent Tributes</h1>
            </Col>
            <Col md={6} className="d-flex justify-content-end align-items-center">
              <div className="search-wrapper position-relative" style={{ width: '300px' }}>
                <Input
                  type="text"
                  placeholder="Obituary search..."
                  value={searchQuery}
                  onChange={this.handleSearchChange}
                  onKeyPress={this.handleSearchKeyPress}
                  className="search-input rounded-pill pl-4 pr-5"
                />
                <Search
                  className="search-icon position-absolute"
                  size={20}
                  style={{
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer'
                  }}
                  onClick={this.handleSearch}
                />
              </div>
            </Col>
          </Row>

          {/* Loading State */}
          {loading && (
            <Row>
              <Col className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-3">Loading tributes...</p>
              </Col>
            </Row>
          )}

          {/* Error State */}
          {error && (
            <Row>
              <Col>
                <div className="alert alert-danger" role="alert">
                  <h4 className="alert-heading">Error</h4>
                  <p>{error}</p>
                  <Button color="primary" onClick={this.fetchRecentTributes}>
                    Try Again
                  </Button>
                </div>
              </Col>
            </Row>
          )}

          {/* Tributes Carousel */}
          {!loading && !error && tributes.length > 0 && (
            <div className="tributes-carousel position-relative">
              {/* Navigation Buttons */}
              <Button
                color="light"
                className="carousel-nav-btn carousel-nav-prev position-absolute"
                onClick={this.handlePrevious}
                disabled={currentIndex === 0}
                style={{
                  left: '-20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronLeft size={24} />
              </Button>

              <Button
                color="light"
                className="carousel-nav-btn carousel-nav-next position-absolute"
                onClick={this.handleNext}
                disabled={currentIndex >= maxIndex}
                style={{
                  right: '-20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronRight size={24} />
              </Button>

              {/* Cards Grid */}
              <Row>
                {visibleTributes.map((tribute) => (
                  <Col
                    key={tribute.id}
                    xs={6}
                    sm={4}
                    md={4}
                    lg={2}
                    className="mb-4"
                  >
                    <Link
                      to={`/obituary/${tribute.slug}`}
                      className="text-decoration-none"
                    >
                      <div className="tribute-card text-center">
                        <div className="tribute-image-wrapper mb-3">
                          <img
                            src={tribute.image}
                            alt={tribute.name}
                            className="tribute-image img-fluid rounded shadow-sm"
                            style={{
                              width: '100%',
                              height: '200px',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                            }}
                          />
                        </div>
                        <h3 className="tribute-name text-uppercase font-weight-bold mb-1"
                          style={{ fontSize: '0.9rem' }}>
                          {tribute.name}
                        </h3>
                        <p className="tribute-date text-muted mb-1 small">{tribute.date}</p>
                        <p className="tribute-location text-muted small">{tribute.location}</p>
                      </div>
                    </Link>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && tributes.length === 0 && (
            <Row>
              <Col className="text-center py-5">
                <h3>No tributes found</h3>
                <p className="text-muted">Try adjusting your search or check back later.</p>
              </Col>
            </Row>
          )}

          {/* Action Buttons */}
          {!loading && tributes.length > 0 && (
            <Row className="mt-4">
              <Col className="d-flex justify-content-center">
                <Link to="/obituaries">
                  <Button
                    outline
                    color="dark"
                    className="tributes-action-btn rounded-pill text-uppercase font-weight-bold mx-2"
                  >
                    View All Tributes
                  </Button>
                </Link>
                <Link to="/alerts">
                  <Button
                    outline
                    color="dark"
                    className="tributes-action-btn rounded-pill text-uppercase font-weight-bold mx-2"
                  >
                    Join Obituary Alerts
                  </Button>
                </Link>
              </Col>
            </Row>
          )}
        </Container>

        {/* Welcome Section */}
        <Container style={{ maxWidth: '90vw', width: '90vw' }} className="welcome-section">
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <div className="welcome-image-wrapper">
                <img
                  src="https://s3.amazonaws.com/CFSV2/siteimages/wvr/321486-img.jpg"
                  alt="Funeral Home Interior"
                  className="img-fluid rounded shadow"
                />
              </div>
            </Col>
            <Col md={6}>
              <div className="welcome-content pl-md-4">
                <p className="welcome-label text-uppercase text-muted mb-2">WELCOME TO</p>
                <h2 className="welcome-title mb-4">West River Funeral Directors LLC</h2>
                <p className="welcome-text mb-4">
                  Welcome to our website. We provide individualized funeral services designed to meet
                  the needs of each family. Our staff of dedicated professionals is available to assist you
                  in making funeral service arrangements. From casket choices to funeral flowers, we will
                  guide you through all aspects of the funeral service.
                </p>
                <p className="welcome-text mb-4">
                  We invite you to <Link to="/contact" className="contact-link">contact us</Link> with your questions, 24 hours a day, 7 days a week.
                </p>
                <Link to="/about">
                  <Button color="primary" size="lg" className="welcome-cta-btn">
                    Learn More
                  </Button>
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

export default connect(mapStateToProps, actions)(Homepage);