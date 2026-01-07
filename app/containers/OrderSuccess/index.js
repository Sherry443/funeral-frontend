/**
 * Order Success Page
 * Shown after successful payment
 */

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import Button from '../../components/Common/Button';
import './OrderSuccess.css';

const OrderSuccess = props => {
  const { user } = props;

  useEffect(() => {
    // Clear cart from localStorage on success
    localStorage.removeItem('cart_id');
  }, []);

  return (
    <div className="order-success-page">
      <Container>
        <Row className="justify-content-center">
          <Col lg="8" md="10">
            <div className="success-card">
              <div className="success-icon">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <h1 className="success-title">Order Placed Successfully! 🎉</h1>
              <p className="success-message">
                Thank you for your purchase. Your order has been confirmed and will be processed shortly.
              </p>

              <div className="order-details">
                <div className="detail-item">
                  <span className="detail-label">Order confirmation sent to:</span>
                  <span className="detail-value">{user?.email}</span>
                </div>
              </div>

              <div className="info-box">
                <h5>What's Next?</h5>
                <ul>
                  <li>You will receive an order confirmation email shortly</li>
                  <li>Track your order status in your account dashboard</li>
                  <li>You'll be notified when your order ships</li>
                </ul>
              </div>

              <div className="action-buttons">
                <Link to="/dashboard/orders">
                  <Button
                    variant="primary"
                    text="View Order History"
                    className="mr-3"
                  />
                </Link>
                <Link to="/shop">
                  <Button
                    variant="secondary"
                    text="Continue Shopping"
                  />
                </Link>
              </div>

              <div className="support-text">
                <p>
                  Need help? <Link to="/contact">Contact Support</Link>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    user: state.account.user
  };
};

export default connect(mapStateToProps)(OrderSuccess);