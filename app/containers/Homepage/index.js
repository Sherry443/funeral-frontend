import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Input } from 'reactstrap';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, MapPin, Phone, Mail } from 'lucide-react';

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

  componentDidMount() {
    this.fetchRecentTributes();
  }

  fetchRecentTributes = async () => {
    try {
      this.setState({ loading: true, error: null });

      const response = await fetch('https://funeralbackend.onrender.com/api/obituaries/recent', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tributes');
      }

      const data = await response.json();

      const formattedTributes = data.map(obituary => ({
        id: obituary._id,
        name: `${obituary.firstName} ${obituary.lastName}`.toUpperCase(),
        date: this.formatDate(obituary.deathDate),
        location: obituary.location || 'Unknown',
        image: obituary.photo,
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
        image: obituary.photo,
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
        {/* Hero Banner Section - "Celebrate Life" */}
        <div className='hero-banner-section'>
          <div className='hero-slide'>
            <div
              className='hero-slide-bg'
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1600)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '500px',
                position: 'relative'
              }}
            >
              <div className='hero-overlay'></div>
              <div className='hero-content'>
                <div className='hero-text-wrapper'>
                  <h1 className='hero-title'>Celebrate Life</h1>
                  <Link to='/services'>
                    <button className='hero-cta-button'>
                      OUR SERVICES
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tributes Section */}
        <Container fluid className="tributes-section-wrapper">
          <Container style={{ maxWidth: '1400px' }}>
            <Row className="tributes-header mb-4 pb-3">
              <Col lg={6} className="d-flex align-items-center mb-3 mb-lg-0">
                <h2 className="tributes-title mb-0">Recent Tributes</h2>
              </Col>
              <Col lg={6} className="d-flex justify-content-lg-end align-items-center">
                <div className="search-wrapper position-relative">
                  <Input
                    type="text"
                    placeholder="Obituary search..."
                    value={searchQuery}
                    onChange={this.handleSearchChange}
                    onKeyPress={this.handleSearchKeyPress}
                    className="search-input rounded-pill"
                  />
                  <Search
                    className="search-icon position-absolute"
                    size={18}
                    onClick={this.handleSearch}
                  />
                </div>
              </Col>
            </Row>

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

            {error && (
              <Row>
                <Col>
                  <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error</h4>
                    <p>{error}</p>
                    <button color="primary" onClick={this.fetchRecentTributes}>
                      Try Again
                    </button>
                  </div>
                </Col>
              </Row>
            )}

            {!loading && !error && tributes.length > 0 && (
              <div className="tributes-carousel-wrapper">
                <div className="tributes-carousel position-relative">
                  <button
                    className="carousel-nav-btn carousel-nav-prev"
                    onClick={this.handlePrevious}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <button
                    className="carousel-nav-btn carousel-nav-next"
                    onClick={this.handleNext}
                    disabled={currentIndex >= maxIndex}
                  >
                    <ChevronRight size={24} />
                  </button>

                  <Row className="tribute-cards-row">
                    {visibleTributes.map((tribute) => (
                      <Col
                        key={tribute.id}
                        xs={6}
                        sm={4}
                        md={4}
                        lg={2}
                        className="mb-4 tribute-card-col"
                      >
                        <Link
                          to={`/obituary/${tribute.slug}`}
                          className="text-decoration-none"
                        >
                          <div className="tribute-card text-center">
                            <div className="tribute-image-wrapper mb-2">
                              <img
                                src={tribute.image}
                                alt={tribute.name}
                                className="tribute-image"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                                }}
                              />
                            </div>
                            <h3 className="tribute-name">
                              {tribute.name}
                            </h3>
                            <p className="tribute-date">{tribute.date}</p>
                            <p className="tribute-location">{tribute.location}</p>
                          </div>
                        </Link>
                      </Col>
                    ))}
                  </Row>
                </div>

                <Row className="mt-4">
                  <Col className="d-flex justify-content-center flex-wrap">
                    <Link to="/obituaries">
                      <button className="tributes-action-btn mx-2 mb-2">
                        VIEW ALL TRIBUTES
                      </button>
                    </Link>
                    <Link to="/alerts">
                      <button className="tributes-action-btn mx-2 mb-2">
                        JOIN OBITUARY ALERTS
                      </button>
                    </Link>
                  </Col>
                </Row>
              </div>
            )}

            {!loading && !error && tributes.length === 0 && (
              <Row>
                <Col className="text-center py-5">
                  <h3>No tributes found</h3>
                  <p className="text-muted">Try adjusting your search or check back later.</p>
                </Col>
              </Row>
            )}
          </Container>
        </Container>

        {/* Welcome Section */}
        <div className="welcome-section">
          <Container style={{ maxWidth: '1400px' }}>
            <Row className="align-items-center">
              <Col lg={6} className="mb-4 mb-lg-0">
                <div className="welcome-image-wrapper">
                  <img
                    src="https://s3.amazonaws.com/CFSV2/siteimages/wvr/321486-img.jpg"
                    alt="West River Funeral Directors"
                    className="img-fluid welcome-image"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="welcome-content">
                  <p className="welcome-label">WELCOME TO</p>
                  <h2 className="welcome-title">West River Funeral Directors LLC</h2>
                  <p className="welcome-text">
                    Welcome to our website. We provide individualized funeral services designed to meet
                    the needs of each family. Our staff of dedicated professionals is available to assist you
                    in making funeral service arrangements. From casket choices to funeral flowers, we will
                    guide you through all aspects of the funeral service.
                  </p>
                  <p className="welcome-text">
                    We invite you to <Link to="/contact" className="welcome-link">contact us</Link> with your questions, 24 hours a day, 7 days a week.
                  </p>
                  <Link to="/about">
                    <button className="welcome-cta-btn">
                      LEARN MORE
                    </button>
                  </Link>
                </div>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Services Grid Section */}
        <div className="services-grid-section">
          <Container fluid style={{ padding: 0 }}>
            <Row className="g-0">
              <Col md={6} lg={3} className="service-grid-item">
                <Link to="/pre-planning" className="service-card-link">
                  <div
                    className="service-card"
                    style={{
                      backgroundImage: `url(https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="service-card-overlay"></div>
                    <div className="service-card-content">
                      <h3 className="service-card-title">Pre-Plan</h3>
                    </div>
                  </div>
                </Link>
              </Col>

              <Col md={6} lg={3} className="service-grid-item">
                <Link to="/flowers" className="service-card-link">
                  <div
                    className="service-card"
                    style={{
                      backgroundImage: `url(https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="service-card-overlay"></div>
                    <div className="service-card-content">
                      <h3 className="service-card-title">Send Flowers</h3>
                    </div>
                  </div>
                </Link>
              </Col>

              <Col md={6} lg={3} className="service-grid-item">
                <Link to="/grief-support" className="service-card-link">
                  <div
                    className="service-card"
                    style={{
                      backgroundImage: `url(https://images.unsplash.com/photo-1509099652299-30938b0aeb63?w=800)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="service-card-overlay"></div>
                    <div className="service-card-content">
                      <h3 className="service-card-title">Grief Support</h3>
                    </div>
                  </div>
                </Link>
              </Col>

              <Col md={6} lg={3} className="service-grid-item">
                <Link to="/faq" className="service-card-link">
                  <div
                    className="service-card"
                    style={{
                      backgroundImage: `url(https://images.unsplash.com/photo-1517842645767-c639042777db?w=800)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="service-card-overlay"></div>
                    <div className="service-card-content">
                      <h3 className="service-card-title">F.A.Q.</h3>
                    </div>
                  </div>
                </Link>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Testimonials Section */}
        <div className="testimonials-section">
          <Container style={{ maxWidth: '1200px' }}>
            <div className="testimonials-header text-center mb-5">
              <h2 className="testimonials-title">What Our Families are Saying...</h2>
              <p className="testimonials-subtitle">TESTIMONIALS</p>
            </div>

            <Row>
              <Col lg={8} className="mx-auto">
                <div className="testimonial-card">
                  <p className="testimonial-text">
                    "We are always impressed in hearing from the families that we serve. Please take a moment to let us know how we are doing by sharing your experience via our testimonials link. We very much appreciate your feedback."
                  </p>
                  <div className="text-center mt-4">
                    <Link to="/testimonials">
                      <button className="testimonial-btn">
                        Click to enter your testimonial »
                      </button>
                    </Link>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Google Reviews Section */}
        <div className="google-reviews-section">
          <Container style={{ maxWidth: '800px' }}>
            <div className="text-center">
              <h3 className="google-reviews-title">See Our Google Reviews</h3>
              <div className="qr-code-wrapper mt-4">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://g.page/r/YOUR_GOOGLE_REVIEW_LINK"
                  alt="QR Code for Google Reviews"
                  className="qr-code-image"
                />
              </div>
            </div>
          </Container>
        </div>

        {/* Location Section */}
        <div className="location-section">
          <Container fluid style={{ padding: 0 }}>
            <Row className="g-0">
              <Col lg={6}>
                <div className="location-info">
                  <h3 className="location-title">Our Location</h3>
                  <div className="location-details">
                    <div className="location-detail-item">
                      <MapPin size={20} />
                      <div>
                        <p className="mb-0"><strong>West River Funeral Directors LLC</strong></p>
                        <p className="mb-0">602 East Saint Patrick St. Ste 101</p>
                        <p className="mb-0">Rapid City, SD 57701</p>
                      </div>
                    </div>
                    <div className="location-detail-item">
                      <Phone size={20} />
                      <div>
                        <p className="mb-0">Tel: 1-605-787-3080</p>
                        <p className="mb-0">Fax: 1-605-484-4023</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={6}>
                <div className="location-map">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2843.8!2d-103.2!3d44.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDTCsDA0JzQ4LjAiTiAxMDPCsDEyJzAwLjAiVw!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    title="West River Funeral Directors Location"
                  ></iframe>
                </div>
              </Col>
            </Row>
          </Container>
        </div>

        {/* View Services CTA */}
        <div className="view-services-cta">
          <Container>
            <div className="text-center">
              <Link to="/services">
                <button className="view-services-btn">
                  VIEW SERVICES
                </button>
              </Link>
            </div>
          </Container>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

export default connect(mapStateToProps, actions)(Homepage);