/**
 * Order Summary Component
 * Displays cart items and total calculation
 */

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

      <style jsx>{`
        .order-summary-container {
          position: sticky;
          top: 20px;
        }

        .order-summary {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .order-summary h4 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .items-list {
          margin-bottom: 20px;
        }

        .summary-item {
          display: flex;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .item-image-container {
          flex-shrink: 0;
        }

        .item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .item-details {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          font-weight: 500;
          margin: 0 0 5px 0;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-meta {
          color: #666;
          font-size: 13px;
          margin: 0;
        }

        .item-price {
          flex-shrink: 0;
          font-weight: 600;
          color: #333;
        }

        .summary-divider {
          height: 1px;
          background: #e0e0e0;
          margin: 20px 0;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 15px;
        }

        .summary-row span:first-child {
          color: #666;
        }

        .summary-row span:last-child {
          font-weight: 500;
          color: #333;
        }

        .total-row {
          font-size: 18px;
          font-weight: 600;
          padding-top: 15px;
        }

        .total-row span {
          color: #000;
        }

        .secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          padding: 12px;
          background: #f0f8ff;
          border-radius: 6px;
          color: #0570de;
          font-size: 14px;
          font-weight: 500;
        }

        .secure-badge i {
          font-size: 16px;
        }

        .text-muted {
          color: #999 !important;
        }

        .text-success {
          color: #28a745 !important;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default OrderSummary;