/**
 * Order Confirmation Page
 * Shows after successful payment
 */

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import axios from 'axios';
import "./OrderConfirmation.css"
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
        `https://funeralbackend.onrender.com/api/order/${orderId}`,
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


    </div>
  );
};

export default OrderConfirmation;