import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

/**
 * Checkout Form Component
 * Handles the actual payment form and submission
 */
const CheckoutForm = ({ clientSecret, cartId, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            // Confirm the payment with Stripe
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout/success`,
                },
                redirect: 'if_required', // Don't redirect, handle in same page
            });

            if (error) {
                setErrorMessage(error.message);
                setLoading(false);
                if (onError) onError(error);
                return;
            }

            // Payment succeeded, now confirm with your backend
            if (paymentIntent && paymentIntent.status === 'succeeded') {
                const response = await fetch('/api/order/stripe/confirm-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id,
                        cartId: cartId,
                        billingDetails: {
                            name: 'Customer Name', // Get from form
                            email: 'customer@example.com', // Get from form
                        },
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    if (onSuccess) onSuccess(data.order);
                } else {
                    setErrorMessage(data.error || 'Payment confirmation failed');
                    if (onError) onError(data);
                }
            }
        } catch (err) {
            setErrorMessage(err.message || 'An unexpected error occurred');
            if (onError) onError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <div className="payment-element-container">
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || loading}
                className="submit-button"
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: loading ? '#ccc' : '#5469d4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '20px',
                }}
            >
                {loading ? 'Processing...' : 'Pay Now'}
            </button>
        </form>
    );
};

/**
 * Main Checkout Page Component
 * Manages the payment intent creation and displays the checkout form
 */
const CheckoutPage = ({ cartId, amount, products }) => {
    const [clientSecret, setClientSecret] = useState('');
    const [paymentIntentId, setPaymentIntentId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        createPaymentIntent();
    }, []);

    const createPaymentIntent = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('Creating payment intent...', { cartId, amount });

            const response = await fetch('api/order/stripe/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cartId,
                    amount,
                    currency: 'usd',
                    products,
                }),
            });

            const data = await response.json();

            console.log('Payment intent response:', data);

            if (data.success && data.clientSecret) {
                setClientSecret(data.clientSecret);
                setPaymentIntentId(data.paymentIntentId);
            } else {
                setError(data.error || 'Failed to initialize payment');
            }
        } catch (err) {
            console.error('Error creating payment intent:', err);
            setError(err.message || 'Failed to initialize payment');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = (order) => {
        console.log('Payment successful!', order);
        // Redirect to success page
        window.location.href = `/order/success/${order._id}`;
    };

    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        setError(error.message || 'Payment failed');
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>Loading payment form...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ color: 'red', marginBottom: '20px' }}>
                    Error: {error}
                </div>
                <button
                    onClick={createPaymentIntent}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#5469d4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>Initializing checkout...</div>
            </div>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#5469d4',
            },
        },
    };

    return (
        <div className="checkout-page" style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Complete Your Payment</h2>

            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f7f7f7', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>Subtotal:</span>
                    <span>${amount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                    <span>Total:</span>
                    <span>${amount.toFixed(2)}</span>
                </div>
            </div>

            <Elements stripe={stripePromise} options={options}>
                <CheckoutForm
                    clientSecret={clientSecret}
                    cartId={cartId}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                />
            </Elements>
        </div>
    );
};

export default CheckoutPage;


/**
 * USAGE EXAMPLE:
 * 
 * In your cart or checkout flow:
 * 
 * import CheckoutPage from './components/CheckoutPage';
 * 
 * function Cart() {
 *   const [showCheckout, setShowCheckout] = useState(false);
 *   
 *   const handleContinueToPayment = () => {
 *     setShowCheckout(true);
 *   };
 *   
 *   if (showCheckout) {
 *     return (
 *       <CheckoutPage
 *         cartId={cart._id}
 *         amount={cart.total}
 *         products={cart.products}
 *       />
 *     );
 *   }
 *   
 *   return (
 *     // Your cart UI
 *     <button onClick={handleContinueToPayment}>
 *       Continue to Payment
 *     </button>
 *   );
 * }
 */