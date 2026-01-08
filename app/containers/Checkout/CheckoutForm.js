/**
 * COMPLETE CHECKOUT COMPONENT - FINAL FIXED VERSION
 * Fixed clearCart action import
 */

import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { Form, FormGroup, Label, Input, Row, Col, Spinner } from 'reactstrap';
import Button from '../../components/Common/Button';
import { success } from 'react-notification-system-redux';

// ✅ FIXED: Import clearCart directly from the cart actions
import { clearCart } from '../Cart/actions';

const API_URL = process.env.REACT_APP_API_URL || 'https://funeralbackend.onrender.com/';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// ==============================================
// PAYMENT FORM - Only rendered when Elements is ready
// ==============================================
const PaymentForm = (props) => {
    const {
        cartItems,
        cartTotal,
        user,
        setError,
        clearCart: clearCartAction,
        showSuccessNotification,
        cartId
    } = props;

    const stripe = useStripe();
    const elements = useElements();
    const history = useHistory();
    const isMountedRef = useRef(true);

    const [isProcessing, setIsProcessing] = useState(false);
    const [billingDetails, setBillingDetails] = useState({
        name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
        email: user?.email || '',
        phone: '',
        address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'US'
        }
    });

    useEffect(() => {
        console.log('✅ PaymentForm mounted, Stripe ready:', !!stripe);
        console.log('✅ Elements ready:', !!elements);

        return () => {
            isMountedRef.current = false;
        };
    }, [stripe, elements]);

    const handleBillingChange = e => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setBillingDetails(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setBillingDetails(prev => ({ ...prev, [name]: value }));
        }
    };

    const getAuthToken = () => {
        return localStorage.getItem('token') ||
            localStorage.getItem('authToken') ||
            localStorage.getItem('access_token');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            console.log('⚠️ Stripe or Elements not ready');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            console.log('💳 Confirming payment with Stripe...');

            const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order-success`,
                    payment_method_data: {
                        billing_details: {
                            name: billingDetails.name,
                            email: billingDetails.email,
                            phone: billingDetails.phone,
                            address: billingDetails.address
                        }
                    }
                },
                redirect: 'if_required'
            });

            if (stripeError) {
                console.error('❌ Stripe error:', stripeError);
                setError(stripeError.message);
                setIsProcessing(false);
                return;
            }

            console.log('✅ Payment confirmed:', paymentIntent);

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                const token = getAuthToken();
                const config = {
                    headers: { 'Content-Type': 'application/json' }
                };

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                try {
                    await axios.post(
                        `${API_URL}/api/order/stripe/confirm-payment`,
                        {
                            paymentIntentId: paymentIntent.id,
                            cartId: cartId,
                            billingDetails,
                            shippingDetails: billingDetails
                        },
                        config
                    );

                    console.log('✅ Order confirmed with backend');

                    // ✅ FIXED: Call clearCartAction (the prop)
                    clearCartAction();
                    localStorage.removeItem('cart_id');

                    showSuccessNotification({
                        title: '✅ Order Placed Successfully!',
                        message: 'Check your email for confirmation',
                        position: 'tr',
                        autoDismiss: 3
                    });

                    setTimeout(() => {
                        if (isMountedRef.current) {
                            history.push('/order-success');
                        }
                    }, 1000);
                } catch (backendError) {
                    console.error('⚠️ Backend confirmation error:', backendError);

                    // ✅ FIXED: Call clearCartAction (the prop)
                    clearCartAction();
                    localStorage.removeItem('cart_id');

                    showSuccessNotification({
                        title: '✅ Payment Successful!',
                        message: 'Your payment was processed',
                        position: 'tr',
                        autoDismiss: 3
                    });

                    setTimeout(() => {
                        if (isMountedRef.current) {
                            history.push('/order-success');
                        }
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('❌ Payment error:', error);
            setError(error.response?.data?.error || 'Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {/* Billing Information */}
            <div className="billing-section mb-4">
                <h5 className="mb-3">Billing Information</h5>

                <Row>
                    <Col md="6">
                        <FormGroup>
                            <Label>Full Name *</Label>
                            <Input
                                type="text"
                                name="name"
                                value={billingDetails.name}
                                onChange={handleBillingChange}
                                required
                                placeholder="John Doe"
                            />
                        </FormGroup>
                    </Col>
                    <Col md="6">
                        <FormGroup>
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                name="email"
                                value={billingDetails.email}
                                onChange={handleBillingChange}
                                required
                                placeholder="john@example.com"
                            />
                        </FormGroup>
                    </Col>
                </Row>

                <FormGroup>
                    <Label>Phone *</Label>
                    <Input
                        type="tel"
                        name="phone"
                        value={billingDetails.phone}
                        onChange={handleBillingChange}
                        required
                        placeholder="+1 (555) 123-4567"
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Address *</Label>
                    <Input
                        type="text"
                        name="address.line1"
                        value={billingDetails.address.line1}
                        onChange={handleBillingChange}
                        required
                        placeholder="123 Main Street"
                    />
                </FormGroup>

                <Row>
                    <Col md="5">
                        <FormGroup>
                            <Label>City *</Label>
                            <Input
                                type="text"
                                name="address.city"
                                value={billingDetails.address.city}
                                onChange={handleBillingChange}
                                required
                                placeholder="New York"
                            />
                        </FormGroup>
                    </Col>
                    <Col md="3">
                        <FormGroup>
                            <Label>State *</Label>
                            <Input
                                type="text"
                                name="address.state"
                                value={billingDetails.address.state}
                                onChange={handleBillingChange}
                                required
                                placeholder="NY"
                                maxLength="2"
                            />
                        </FormGroup>
                    </Col>
                    <Col md="4">
                        <FormGroup>
                            <Label>ZIP *</Label>
                            <Input
                                type="text"
                                name="address.postal_code"
                                value={billingDetails.address.postal_code}
                                onChange={handleBillingChange}
                                required
                                placeholder="10001"
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </div>

            {/* Payment Element */}
            <div className="payment-section mb-4">
                <h5 className="mb-3">Payment Information</h5>
                <div className="payment-element-wrapper p-3 border rounded bg-white">
                    <PaymentElement
                        options={{
                            layout: 'tabs',
                        }}
                    />
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                variant="primary"
                disabled={isProcessing || !stripe || !elements}
                text={isProcessing ? 'Processing Payment...' : `Pay $${cartTotal.toFixed(2)}`}
                className="w-100"
            />

            <p className="text-center text-muted small mt-3">
                🔒 Secure payment powered by Stripe
            </p>
        </Form>
    );
};

// ==============================================
// MAIN CHECKOUT COMPONENT - Creates payment intent first
// ==============================================
const CheckoutForm = (props) => {
    const { cartItems, cartTotal, setError } = props;

    const [clientSecret, setClientSecret] = useState('');
    const [cartId, setCartId] = useState('');
    const [loading, setLoading] = useState(true);
    const [initError, setInitError] = useState('');

    useEffect(() => {
        console.log('🔵 CheckoutForm mounted, creating payment intent...');
        createPaymentIntent();
    }, []);

    const createPaymentIntent = async () => {
        try {
            setLoading(true);
            setInitError('');

            const storedCartId = localStorage.getItem('cart_id');
            const token = localStorage.getItem('token') ||
                localStorage.getItem('authToken') ||
                localStorage.getItem('access_token');

            console.log('📤 Creating payment intent...');
            console.log('Cart ID:', storedCartId);
            console.log('Token exists:', !!token);

            const config = {
                headers: { 'Content-Type': 'application/json' }
            };

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            const requestData = {
                cartId: storedCartId || null,
                amount: cartTotal,
                currency: 'usd',
                products: cartItems.map(item => ({
                    product: item._id || item.id,
                    quantity: item.quantity,
                    price: item.price,
                    taxable: item.taxable !== false
                }))
            };

            console.log('📦 Request data:', requestData);

            const response = await axios.post(
                `${API_URL}api/order/stripe/create-payment-intent`,
                requestData,
                config
            );

            console.log('✅ Payment intent created:', response.data);

            if (response.data.success && response.data.clientSecret) {
                console.log('🔑 Setting clientSecret:', response.data.clientSecret);
                setClientSecret(response.data.clientSecret);
                setCartId(storedCartId || '');
            } else {
                throw new Error('No client secret returned from server');
            }
        } catch (error) {
            console.error('❌ Error creating payment intent:', error);
            console.error('Response:', error.response?.data);

            const errorMsg = error.response?.data?.error ||
                error.message ||
                'Failed to initialize payment';
            setInitError(errorMsg);
            if (setError) setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Show loading state
    if (loading) {
        console.log('⏳ Showing loading state...');
        return (
            <div className="text-center py-5">
                <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-3">Preparing secure checkout...</p>
            </div>
        );
    }

    // Show error state
    if (initError || !clientSecret) {
        console.log('❌ Showing error state:', initError);
        return (
            <div className="alert alert-danger">
                <h5>⚠️ Payment Initialization Failed</h5>
                <p>{initError || 'Could not initialize payment. Please try again.'}</p>
                <button
                    className="btn btn-primary mt-2"
                    onClick={createPaymentIntent}
                >
                    Try Again
                </button>
            </div>
        );
    }

    // CRITICAL: Only render Elements when we have clientSecret
    console.log('✅ clientSecret exists, rendering Elements wrapper');
    console.log('🔑 clientSecret:', clientSecret);

    const elementsOptions = {
        clientSecret: clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#0570de',
                colorBackground: '#ffffff',
                colorText: '#30313d',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }
        }
    };

    console.log('🎨 Elements options:', elementsOptions);

    return (
        <div className="checkout-form-wrapper">
            <Elements
                stripe={stripePromise}
                options={elementsOptions}
                key={clientSecret} // Force re-render when clientSecret changes
            >
                <PaymentForm
                    {...props}
                    cartId={cartId}
                />
            </Elements>
        </div>
    );
};

const mapStateToProps = (state) => ({
    user: state.account?.user || null,
});

const mapDispatchToProps = (dispatch) => ({
    // ✅ FIXED: Dispatch clearCart correctly
    clearCart: () => dispatch(clearCart()),
    showSuccessNotification: (options) => dispatch(success(options))
});

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutForm);