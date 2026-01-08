/**
 * Order Summary Component
 * Displays cart items and total calculation
 */
import "./OrderSummary.css"

import React from 'react';

const OrderSummary = ({ cartItems, cartTotal }) => {
  // Calculate tax (using same rate as backend)
  const TAX_RATE = 0.08; // 8% - match with your backend config
  const subtotal = cartTotal;
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  return (
    <div className="order-summary-container">
      <div className="order-summary">
        <h4>Order Summary</h4>

        <div className="items-list">
          {cartItems.map((item, index) => (
            <div key={index} className="summary-item">
              <div className="item-image-container">
                <img
                  src={item.imageUrl || '/images/placeholder-image.png'}
                  alt={item.name}
                  className="item-image"
                />
              </div>
              <div className="item-details">
                <p className="item-name">{item.name}</p>
                <p className="item-meta">
                  Qty: {item.quantity} × ${item.price}
                </p>
              </div>
              <div className="item-price">
                <p>${item.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="summary-divider"></div>

        <div className="summary-row">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="summary-row">
          <span>Tax (8%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <div className="summary-row">
          <span className="text-muted">Shipping</span>
          <span className="text-success">FREE</span>
        </div>

        <div className="summary-divider"></div>

        <div className="summary-row total-row">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <div className="secure-badge">
          <i className="icon-lock"></i>
          <span>Secure Checkout</span>
        </div>
      </div>


    </div>
  );
};

export default OrderSummary;