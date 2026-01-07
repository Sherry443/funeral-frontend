/**
 * Checkout Page Component (Stripe Loading Fixed)
 * Ensures Stripe loads before showing payment form
 */

import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import CheckoutForm from './CheckoutForm';
import OrderSummary from './OrderSummary';
import './CheckoutPage.css';

// Get Stripe key
const STRIPE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

console.log('🔑 Stripe Key from env:', STRIPE_KEY);

// Initialize Stripe OUTSIDE component - This is critical!
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

const CheckoutPage = props => {
    const { cartItems, cartTotal, authenticated, user } = props;
    const [error, setError] = useState('');
    const [stripeLoaded, setStripeLoaded] = useState(false);

    // Check if Stripe is loaded
    useEffect(() => {
        const checkStripe = async () => {
            if (!STRIPE_KEY) {
                console.error('❌ Stripe publishable key not found!');
                setError('Payment system not configured. Please contact support.');
                return;
            }

            try {
                const stripe = await stripePromise;
                if (stripe) {
                    console.log('✅ Stripe loaded successfully:', stripe);
                    setStripeLoaded(true);
                } else {
                    console.error('❌ Stripe failed to load');
                    setError('Failed to load payment system. Please refresh the page.');
                }
            } catch (err) {
                console.error('❌ Error loading Stripe:', err);
                setError('Failed to load payment system. Please refresh the page.');
            }
        };

        checkStripe();
    }, []);

    // Redirect if cart is empty
    if (!cartItems || cartItems.length === 0) {
        return <Redirect to="/shop" />;
    }

    // Redirect if not authenticated
    if (!authenticated) {
        return <Redirect to="/login" />;
    }

    // Show error if Stripe key is missing
    if (!STRIPE_KEY) {
        return (
            <div className="checkout-page">
                <Container>
                    <div className="alert alert-danger mt-5" role="alert">
                        <h4>⚠️ Configuration Error</h4>
                        <p>Stripe publishable key is not configured.</p>
                        <p className="mb-0">
                            <small>
                                Please add <code>REACT_APP_STRIPE_PUBLISHABLE_KEY</code> to your <code>.env</code> file
                            </small>
                        </p>
                    </div>
                </Container>
            </div>
        );
    }

    // Show loading while Stripe initializes
    if (!stripeLoaded) {
        return (
            <div className="checkout-page">
                <Container>
                    <div className="text-center mt-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-3">Loading payment system...</p>
                    </div>
                </Container>
            </div>
        );
    }

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#0570de',
            colorBackground: '#ffffff',
            colorText: '#30313d',
            colorDanger: '#df1b41',
            fontFamily: 'Ideal Sans, system-ui, sans-serif',
            spacingUnit: '2px',
            borderRadius: '4px'
        }
    };

    const options = {
        appearance
    };

    return (
        <div className="checkout-page">
            <Container>
                <div className="checkout-header">
                    <h2>Checkout</h2>
                    <p className="text-muted">Complete your purchase</p>
                </div>

                <Row>
                    <Col lg="7" md="12">
                        <div className="payment-form-container">
                            <h4>Payment Information</h4>
                            <p className="text-muted mb-4">
                                Your payment information will be processed securely by Stripe.
                            </p>

                            {/* Wrap CheckoutForm in Elements provider */}
                            <Elements stripe={stripePromise} options={options}>
                                <CheckoutForm
                                    cartItems={cartItems}
                                    cartTotal={cartTotal}
                                    user={user}
                                    setError={setError}
                                />
                            </Elements>
                        </div>

                        {error && (
                            <div className="alert alert-danger mt-3" role="alert">
                                {error}
                            </div>
                        )}
                    </Col>

                    <Col lg="5" md="12">
                        <OrderSummary cartItems={cartItems} cartTotal={cartTotal} />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

const mapStateToProps = state => {
    return {
        cartItems: state.cart.cartItems,
        cartTotal: state.cart.cartTotal,
        authenticated: state.authentication.authenticated,
        user: state.account.user
    };
};

export default connect(mapStateToProps)(CheckoutPage);