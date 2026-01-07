/**
 * Checkout Form - Debug Version
 * With console logs to identify issues
 */

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import { Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';

import Button from '../../Common/Button';
import { clearCart } from '../Cart/actions';
import { success } from 'react-notification-system-redux';
import './CheckoutForm.css';

const CheckoutForm = props => {
    const { cartItems, cartTotal, user, setError, clearCart: clearCartAction, showNotification } = props;

    const stripe = useStripe();
    const elements = useElements();
    const history = useHistory();

    console.log('🔧 CheckoutForm mounted');
    console.log('📦 Cart Items:', cartItems);
    console.log('💰 Cart Total:', cartTotal);
    console.log('👤 User:', user);
    console.log('🔑 Stripe loaded:', !!stripe);
    console.log('📝 Elements loaded:', !!elements);

    // Form states
    const [isProcessing, setIsProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [orderId, setOrderId] = useState('');
    const [paymentReady, setPaymentReady] = useState(false);

    // Billing details
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

    // Shipping details
    const [shippingDetails, setShippingDetails] = useState({
        name: '',
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

    const [sameAsBilling, setSameAsBilling] = useState(true);

    const handleBillingChange = e => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setBillingDetails(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setBillingDetails(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleShippingChange = e => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setShippingDetails(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setShippingDetails(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const createPaymentIntent = async () => {
        console.log('🚀 Creating payment intent...');

        try {
            setIsProcessing(true);
            const cartId = localStorage.getItem('cart_id');
            const token = localStorage.getItem('token');

            console.log('📦 Cart ID:', cartId);
            console.log('🔑 Token exists:', !!token);

            if (!cartId) {
                console.error('❌ No cart ID found');
                setError('Cart ID not found. Please try adding items to cart again.');
                setIsProcessing(false);
                return;
            }

            if (!token) {
                console.error('❌ No auth token found');
                setError('Authentication token not found. Please login again.');
                setIsProcessing(false);
                return;
            }

            const shippingData = sameAsBilling ? billingDetails : shippingDetails;

            const requestData = {
                cartId,
                billingDetails,
                shippingDetails: shippingData
            };

            console.log('📤 Sending request:', requestData);

            const response = await axios.post(
                'http://localhost:3000/api/order/create-payment-intent',
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Payment intent created:', response.data);

            setClientSecret(response.data.clientSecret);
            setOrderId(response.data.orderId);
            setPaymentReady(true);
            setIsProcessing(false);

            console.log('✅ Payment form should now be visible');
        } catch (error) {
            console.error('❌ Error creating payment intent:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);

            const errorMessage = error.response?.data?.error || error.message || 'Failed to initialize payment';
            setError(errorMessage);
            setIsProcessing(false);
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        console.log('📋 Form submitted');
        console.log('💳 Payment ready:', paymentReady);
        console.log('🔐 Client secret exists:', !!clientSecret);

        if (!stripe || !elements) {
            console.error('❌ Stripe not loaded');
            return;
        }

        // Step 1: Create payment intent if not created
        if (!clientSecret) {
            console.log('⏭️ Creating payment intent first...');
            await createPaymentIntent();
            return;
        }

        // Step 2: Confirm payment
        console.log('💳 Confirming payment...');
        setIsProcessing(true);
        setError('');

        try {
            const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order-confirmation/${orderId}`
                },
                redirect: 'if_required'
            });

            if (stripeError) {
                console.error('❌ Stripe error:', stripeError);
                setError(stripeError.message);
                setIsProcessing(false);
                return;
            }

            console.log('✅ Payment intent:', paymentIntent);

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log('✅ Payment succeeded, confirming with backend...');

                // Confirm with backend
                await axios.post(
                    'http://localhost:3000/api/order/confirm-payment',
                    {
                        orderId: orderId,
                        paymentIntentId: paymentIntent.id
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                console.log('✅ Order confirmed with backend');

                // Clear cart
                clearCartAction();

                // Show success notification
                showNotification({
                    title: '✅ Order Placed Successfully!',
                    message: 'Check your email for confirmation',
                    position: 'tr',
                    autoDismiss: 3
                });

                // Redirect to confirmation page
                console.log('🔄 Redirecting to confirmation page...');
                history.push(`/order-confirmation/${orderId}`);
            }
        } catch (error) {
            console.error('❌ Payment error:', error);
            console.error('❌ Error response:', error.response?.data);
            setError('Payment failed. Please try again or contact support.');
            setIsProcessing(false);
        }
    };

    console.log('🎨 Rendering form - paymentReady:', paymentReady);

    return (
        <Form onSubmit={handleSubmit}>
            {/* Step 1: Billing Information */}
            {!paymentReady && (
                <>
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
                        <Label>Phone Number *</Label>
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
                        <Label>Address Line 1 *</Label>
                        <Input
                            type="text"
                            name="address.line1"
                            value={billingDetails.address.line1}
                            onChange={handleBillingChange}
                            required
                            placeholder="123 Main Street"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Address Line 2</Label>
                        <Input
                            type="text"
                            name="address.line2"
                            value={billingDetails.address.line2}
                            onChange={handleBillingChange}
                            placeholder="Apartment, suite, etc."
                        />
                    </FormGroup>

                    <Row>
                        <Col md="6">
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
                                />
                            </FormGroup>
                        </Col>
                        <Col md="3">
                            <FormGroup>
                                <Label>ZIP Code *</Label>
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

                    {/* Shipping Address */}
                    <h5 className="mt-4 mb-3">Shipping Information</h5>

                    <FormGroup check className="mb-3">
                        <Input
                            type="checkbox"
                            id="sameAsBilling"
                            checked={sameAsBilling}
                            onChange={e => setSameAsBilling(e.target.checked)}
                        />
                        <Label check htmlFor="sameAsBilling">
                            Same as billing address
                        </Label>
                    </FormGroup>

                    {!sameAsBilling && (
                        <>
                            <FormGroup>
                                <Label>Recipient Name *</Label>
                                <Input
                                    type="text"
                                    name="name"
                                    value={shippingDetails.name}
                                    onChange={handleShippingChange}
                                    required
                                    placeholder="John Doe"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Phone Number *</Label>
                                <Input
                                    type="tel"
                                    name="phone"
                                    value={shippingDetails.phone}
                                    onChange={handleShippingChange}
                                    required
                                    placeholder="+1 (555) 123-4567"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Address Line 1 *</Label>
                                <Input
                                    type="text"
                                    name="address.line1"
                                    value={shippingDetails.address.line1}
                                    onChange={handleShippingChange}
                                    required
                                    placeholder="123 Main Street"
                                />
                            </FormGroup>

                            <Row>
                                <Col md="6">
                                    <FormGroup>
                                        <Label>City *</Label>
                                        <Input
                                            type="text"
                                            name="address.city"
                                            value={shippingDetails.address.city}
                                            onChange={handleShippingChange}
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
                                            value={shippingDetails.address.state}
                                            onChange={handleShippingChange}
                                            required
                                            placeholder="NY"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md="3">
                                    <FormGroup>
                                        <Label>ZIP Code *</Label>
                                        <Input
                                            type="text"
                                            name="address.postal_code"
                                            value={shippingDetails.address.postal_code}
                                            onChange={handleShippingChange}
                                            required
                                            placeholder="10001"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isProcessing}
                        text={isProcessing ? 'Processing...' : 'Continue to Payment'}
                        className="w-100 mt-4"
                        size="lg"
                    />
                </>
            )}

            {/* Step 2: Payment Element */}
            {paymentReady && clientSecret && (
                <>
                    <div className="alert alert-success mb-4">
                        ✅ Payment form loaded successfully!
                    </div>

                    <h5 className="mb-3">Payment Details</h5>
                    <p className="text-muted mb-4">
                        All transactions are secure and encrypted.
                    </p>

                    <div className="payment-element-container mb-4">
                        <PaymentElement
                            options={{
                                layout: 'tabs'
                            }}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isProcessing || !stripe || !elements}
                        text={isProcessing ? 'Processing Payment...' : `Pay $${cartTotal.toFixed(2)}`}
                        className="w-100 mt-4"
                        size="lg"
                    />

                    <p className="secure-notice text-muted text-center mt-3">
                        🔒 Your payment information is secure and encrypted
                    </p>
                </>
            )}

            {/* Debug Info (Remove in production) */}
            <div className="mt-4 p-3 bg-light" style={{ fontSize: '12px' }}>
                <strong>Debug Info:</strong>
                <div>Payment Ready: {paymentReady ? '✅ Yes' : '❌ No'}</div>
                <div>Client Secret: {clientSecret ? '✅ Present' : '❌ Missing'}</div>
                <div>Order ID: {orderId || '❌ Not created'}</div>
                <div>Processing: {isProcessing ? '⏳ Yes' : '✅ No'}</div>
            </div>
        </Form>
    );
};

const mapDispatchToProps = dispatch => {
    return {
        clearCart: () => dispatch(clearCart()),
        showNotification: options => dispatch(success(options))
    };
};

export default connect(null, mapDispatchToProps)(CheckoutForm);