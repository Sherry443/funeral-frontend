/**
 * Order Confirmation Page
 * Shows after successful payment
 */

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import axios from 'axios';

import LoadingIndicator from '../../Common/LoadingIndicator';
import Button from '../../Common/Button';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setOrder(response.data.order);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Could not load order details');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center" style={{ padding: '100px 0' }}>
        <LoadingIndicator />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="text-center" style={{ padding: '100px 0' }}>
        <h3>❌ Order not found</h3>
        <p>{error}</p>
        <Link to="/shop">
          <Button variant="primary" text="Continue Shopping" />
        </Link>
      </Container>
    );
  }

  return (
    <div className="order-confirmation-page">
      <Container>
        <div className="confirmation-header">
          <div className="success-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <p className="lead">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          <p className="order-id">Order ID: #{order._id}</p>
        </div>

        <Row className="mt-5">
          <Col lg="8" className="mx-auto">
            <div className="order-details-card">
              <h3>Order Details</h3>

              <div className="detail-section">
                <h5>Order Information</h5>
                <div className="info-row">
                  <span>Order Date:</span>
                  <span>{new Date(order.created).toLocaleDateString()}</span>
                </div>
                <div className="info-row">
                  <span>Payment Status:</span>
                  <span className="badge badge-success">
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="info-row">
                  <span>Order Status:</span>
                  <span className="badge badge-info">
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h5>Items Ordered</h5>
                {order.cart.products.map((item, index) => (
                  <div key={index} className="order-item">
                    <img
                      src={
                        item.product.imageUrl ||
                        '/images/placeholder-image.png'
                      }
                      alt={item.product.name}
                      className="item-thumbnail"
                    />
                    <div className="item-info">
                      <p className="item-name">{item.product.name}</p>
                      <p className="item-quantity">Quantity: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ${item.totalPrice.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="detail-section">
                <h5>Order Summary</h5>
                <div className="info-row">
                  <span>Subtotal:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="info-row">
                  <span>Tax:</span>
                  <span>${order.totalTax.toFixed(2)}</span>
                </div>
                <div className="info-row">
                  <span>Shipping:</span>
                  <span className="text-success">FREE</span>
                </div>
                <div className="info-row total-row">
                  <span>Total:</span>
                  <span>${order.totalWithTax.toFixed(2)}</span>
                </div>
              </div>

              <div className="detail-section">
                <Row>
                  <Col md="6">
                    <h5>Billing Address</h5>
                    <address>
                      {order.billingDetails.name}<br />
                      {order.billingDetails.address.line1}<br />
                      {order.billingDetails.address.line2 &&
                        `${order.billingDetails.address.line2}<br />`}
                      {order.billingDetails.address.city},{' '}
                      {order.billingDetails.address.state}{' '}
                      {order.billingDetails.address.postal_code}<br />
                      {order.billingDetails.address.country}
                    </address>
                  </Col>
                  <Col md="6">
                    <h5>Shipping Address</h5>
                    <address>
                      {order.shippingDetails.name}<br />
                      {order.shippingDetails.address.line1}<br />
                      {order.shippingDetails.address.line2 &&
                        `${order.shippingDetails.address.line2}<br />`}
                      {order.shippingDetails.address.city},{' '}
                      {order.shippingDetails.address.state}{' '}
                      {order.shippingDetails.address.postal_code}<br />
                      {order.shippingDetails.address.country}
                    </address>
                  </Col>
                </Row>
              </div>

              <div className="email-notice">
                📧 A confirmation email has been sent to{' '}
                <strong>{order.billingDetails.email}</strong>
              </div>

              <div className="action-buttons">
                <Link to="/shop">
                  <Button variant="primary" text="Continue Shopping" />
                </Link>
                <Link to="/dashboard/orders">
                  <Button variant="outline" text="View My Orders" />
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .order-confirmation-page {
          padding: 60px 0;
          min-height: 80vh;
          background: #f8f9fa;
        }

        .confirmation-header {
          text-align: center;
          padding: 40px 0;
        }

        .success-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .confirmation-header h1 {
          font-size: 36px;
          font-weight: 600;
          color: #28a745;
          margin-bottom: 15px;
        }

        .lead {
          font-size: 18px;
          color: #666;
          margin-bottom: 10px;
        }

        .order-id {
          font-size: 14px;
          color: #999;
          font-family: monospace;
        }

        .order-details-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .order-details-card h3 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .detail-section {
          margin-bottom: 35px;
          padding-bottom: 25px;
          border-bottom: 1px solid #e0e0e0;
        }

        .detail-section:last-of-type {
          border-bottom: none;
        }

        .detail-section h5 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #333;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 15px;
        }

        .info-row span:first-child {
          color: #666;
        }

        .info-row span:last-child {
          font-weight: 500;
          color: #333;
        }

        .total-row {
          font-size: 18px;
          font-weight: 600;
          padding-top: 15px;
          border-top: 2px solid #e0e0e0;
          margin-top: 10px;
        }

        .total-row span {
          color: #000;
        }

        .badge {
          padding: 5px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-success {
          background: #d4edda;
          color: #155724;
        }

        .badge-info {
          background: #d1ecf1;
          color: #0c5460;
        }

        .order-item {
          display: flex;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .item-thumbnail {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .item-info {
          flex: 1;
        }

        .item-name {
          font-weight: 500;
          margin: 0 0 5px 0;
        }

        .item-quantity {
          color: #666;
          font-size: 14px;
          margin: 0;
        }

        .item-price {
          font-weight: 600;
          color: #333;
        }

        address {
          font-style: normal;
          line-height: 1.6;
          color: #666;
        }

        .email-notice {
          background: #e7f3ff;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
          color: #0066cc;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 30px;
        }

        .text-success {
          color: #28a745;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;