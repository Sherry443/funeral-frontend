/**
 *
 * ServicesGrid Component
 *
 */

import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';


class ServicesGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            services: [
                {
                    id: 1,
                    title: 'Pre-Plan',
                    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop',
                    link: '/pre-planning'
                },
                {
                    id: 2,
                    title: 'Send Flowers',
                    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop',
                    link: '/flowers'
                },
                {
                    id: 3,
                    title: 'Grief Support',
                    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop',
                    link: '/grief-support'
                },
                {
                    id: 4,
                    title: 'F.A.Q.',
                    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop',
                    link: '/faq'
                }
            ]
        };
    }

    render() {
        const { services } = this.state;

        return (
            <Container fluid className="services-grid-section py-5">
                <Container>
                    <Row>
                        {services.map((service) => (
                            <Col
                                key={service.id}
                                xs={12}
                                sm={6}
                                md={6}
                                lg={6}
                                className="mb-4"
                            >
                                <Link to={service.link} className="service-card-link">
                                    <div className="service-card">
                                        <div
                                            className="service-card-image"
                                            style={{
                                                backgroundImage: `url(${service.image})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        >
                                            <div className="service-card-overlay"></div>
                                            <div className="service-card-content">
                                                <h3 className="service-card-title">{service.title}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </Container>
        );
    }
}

export default ServicesGrid;