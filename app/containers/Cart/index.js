/**
 *
 * Cart (Updated with Place Order)
 *
 */

import React from 'react';
import { connect } from 'react-redux';

import actions from '../../actions';

import CartList from '../../components/Store/CartList';
import CartSummary from '../../components/Store/CartSummary';
import Checkout from '../Checkout';
import { BagIcon } from '../../components/Common/Icon';
import Button from '../../components/Common/Button';

class Cart extends React.PureComponent {
  render() {
    const { isCartOpen, cartItems, cartTotal, toggleCart, authenticated } = this.props;

    return (
      <div className={isCartOpen ? 'cart-drawer open' : 'cart-drawer'}>
        <div className='cart-header'>
          <Button
            borderless
            variant='empty'
            ariaLabel='close cart'
            icon={<BagIcon />}
            onClick={toggleCart}
          />
        </div>
        <div className='cart-body'>
          {cartItems.length > 0 ? (
            <>
              <CartList
                cartItems={cartItems}
                handleRemoveFromCart={this.props.handleRemoveFromCart}
                toggleCart={toggleCart}
              />
            </>
          ) : (
            <div className='empty-cart'>
              <BagIcon />
              <p>Your shopping cart is empty</p>
            </div>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className='cart-footer'>
            <CartSummary cartTotal={cartTotal} />
            <Checkout
              authenticated={authenticated}
              handleShopping={this.props.handleShopping}
              handleCheckout={this.props.handleCheckout}
              placeOrder={this.props.placeOrder}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isCartOpen: state.navigation.isCartOpen,
    cartItems: state.cart.cartItems,
    cartTotal: state.cart.cartTotal,
    authenticated: state.authentication.authenticated
  };
};

export default connect(mapStateToProps, actions)(Cart);