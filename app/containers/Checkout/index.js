/**
 * Checkout Page Container
 * ⚠️ IMPORTANT: Does NOT wrap CheckoutForm in Elements - CheckoutForm handles that itself
 */

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Card, CardBody, Alert } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import CheckoutForm from './CheckoutForm';

const CheckoutPage = (props) => {
  const { cartItems, cartTotal } = props;
  const [error, setError] = useState('');
  const history = useHistory();

  console.log('🏪 CheckoutPage rendered');
  console.log('Cart items:', cartItems?.length);
  console.log('Cart total:', cartTotal);

  // Redirect if cart is empty
  if (!cartItems || cartItems.length === 0) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg="6">
            <Alert color="warning" className="text-center">
              <h4>Your cart is empty</h4>
              <p>Add some items to your cart before checking out.</p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => history.push('/shop')}
              >
                Continue Shopping
              </button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="checkout-page py-4">
      <Row className="justify-content-center">
        <Col lg="8" xl="7">
          <Card className="shadow-sm">
            <CardBody className="p-4">
              {/* Header */}
              <div className="mb-4">
                <h2 className="mb-3">Secure Checkout</h2>
                <p className="text-muted">
                  Complete your purchase securely below
                </p>
              </div>

              {/* Order Summary */}
              <div className="order-summary mb-4 p-3 bg-light rounded">
                <h5 className="mb-3">Order Summary</h5>

                {/* Cart Items */}
                <div className="cart-items mb-3">
                  {cartItems.map((item, index) => (
                    <div
                      key={index}
                      className="d-flex justify-content-between mb-2"
                    >
                      <span className="text-truncate" style={{ maxWidth: '70%' }}>
                        {item.name || item.title || 'Product'} × {item.quantity}
                      </span>
                      <span className="font-weight-bold">
                        ${((item.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <hr />

                {/* Total */}
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Total:</h5>
                  <h4 className="mb-0 text-primary">
                    ${cartTotal.toFixed(2)}
                  </h4>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Alert color="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {/* 
                                ⚠️ IMPORTANT: CheckoutForm handles its own Elements wrapper
                                DO NOT wrap this in <Elements> here!
                            */}
              <CheckoutForm
                cartItems={cartItems}
                cartTotal={cartTotal}
                setError={setError}
              />
            </CardBody>
          </Card>

          {/* Trust Badges */}
          <div className="text-center mt-4 text-muted small">
            <p className="mb-2">
              <span className="me-3">🔒 Secure SSL Encryption</span>
              <span className="me-3">✓ PCI Compliant</span>
              <span>💳 Stripe Powered</span>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

const mapStateToProps = (state) => {
  return {
    cartItems: state.cart?.cartItems || [],
    cartTotal: state.cart?.cartTotal || 0,
  };
};

export default connect(mapStateToProps)(CheckoutPage);