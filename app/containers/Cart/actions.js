/*
 *
 * Cart actions (Fixed version)
 *
 */

import { push } from 'connected-react-router';
import { success } from 'react-notification-system-redux';
import axios from 'axios';

import {
  HANDLE_CART,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  HANDLE_CART_TOTAL,
  SET_CART_ID,
  CLEAR_CART
} from './constants';

import {
  SET_PRODUCT_SHOP_FORM_ERRORS,
  RESET_PRODUCT_SHOP
} from '../Product/constants';

import { API_URL, CART_ID, CART_ITEMS, CART_TOTAL } from '../../constants';
import handleError from '../../utils/error';
import { allFieldsValidation } from '../../utils/validation';
import { toggleCart } from '../Navigation/actions';

// Handle Add To Cart
export const handleAddToCart = product => {
  return (dispatch, getState) => {
    console.log('🛒 handleAddToCart called with product:', product);

    // Get quantity from state, default to 1 if not set
    const productShopData = getState().product.productShopData || {};
    const quantity = Number(productShopData.quantity) || 1;
    const storeProduct = getState().product.storeProduct || {};
    const inventory = storeProduct.inventory || product.quantity || 100;

    console.log('📊 Cart Data:', { quantity, inventory, productShopData });

    // Validate product has required fields
    if (!product._id || !product.name || !product.price) {
      console.error('❌ Product missing required fields:', product);
      const errorOptions = {
        title: 'Error adding to cart',
        message: 'Product information is incomplete',
        position: 'tr',
        autoDismiss: 2
      };
      dispatch(success(errorOptions));
      return;
    }

    // Validate quantity
    const result = calculatePurchaseQuantity(inventory);
    const rules = {
      quantity: `min:1|max:${result}`
    };

    const productToValidate = { quantity };
    const { isValid, errors } = allFieldsValidation(productToValidate, rules, {
      'min.quantity': 'Quantity must be at least 1.',
      'max.quantity': `Quantity may not be greater than ${result}.`
    });

    if (!isValid) {
      console.error('❌ Quantity validation failed:', errors);
      return dispatch({ type: SET_PRODUCT_SHOP_FORM_ERRORS, payload: errors });
    }

    // Prepare product for cart
    const cartProduct = {
      ...product,
      quantity: quantity,
      totalPrice: parseFloat((quantity * product.price).toFixed(2)),
      // Ensure taxable field exists
      taxable: product.taxable !== undefined ? product.taxable : true
    };

    console.log('✅ Adding product to cart:', cartProduct);

    // Reset product shop form
    dispatch({
      type: RESET_PRODUCT_SHOP
    });

    // Add to Redux store
    dispatch({
      type: ADD_TO_CART,
      payload: cartProduct
    });

    // Update localStorage
    const cartItems = JSON.parse(localStorage.getItem(CART_ITEMS)) || [];

    // Check if product already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item._id === cartProduct._id);

    if (existingItemIndex !== -1) {
      // Update quantity if product already exists
      cartItems[existingItemIndex].quantity += quantity;
      cartItems[existingItemIndex].totalPrice = parseFloat(
        (cartItems[existingItemIndex].quantity * cartItems[existingItemIndex].price).toFixed(2)
      );
    } else {
      // Add new product
      cartItems.push(cartProduct);
    }

    localStorage.setItem(CART_ITEMS, JSON.stringify(cartItems));

    // Calculate total and show cart
    dispatch(calculateCartTotal());
    dispatch(toggleCart());

    // Show success message
    const successOptions = {
      title: 'Product added to cart!',
      message: `${product.name} has been added to your cart`,
      position: 'tr',
      autoDismiss: 2
    };
    dispatch(success(successOptions));
  };
};

// Handle Remove From Cart
export const handleRemoveFromCart = product => {
  return (dispatch, getState) => {
    const cartItems = JSON.parse(localStorage.getItem(CART_ITEMS)) || [];
    const newCartItems = cartItems.filter(item => item._id !== product._id);
    localStorage.setItem(CART_ITEMS, JSON.stringify(newCartItems));

    dispatch({
      type: REMOVE_FROM_CART,
      payload: product
    });
    dispatch(calculateCartTotal());

    // Show success message
    const successOptions = {
      title: 'Product removed',
      message: `${product.name} has been removed from your cart`,
      position: 'tr',
      autoDismiss: 1
    };
    dispatch(success(successOptions));
  };
};

export const calculateCartTotal = () => {
  return (dispatch, getState) => {
    const cartItems = getState().cart.cartItems;

    let total = 0;

    cartItems.forEach(item => {
      total += item.price * item.quantity;
    });

    total = parseFloat(total.toFixed(2));
    localStorage.setItem(CART_TOTAL, total);
    dispatch({
      type: HANDLE_CART_TOTAL,
      payload: total
    });
  };
};

// Set cart store from local storage
export const handleCart = () => {
  const cart = {
    cartItems: JSON.parse(localStorage.getItem(CART_ITEMS)) || [],
    cartTotal: localStorage.getItem(CART_TOTAL) || 0,
    cartId: localStorage.getItem(CART_ID)
  };

  return (dispatch, getState) => {
    if (cart.cartItems.length > 0) {
      dispatch({
        type: HANDLE_CART,
        payload: cart
      });
      dispatch(calculateCartTotal());
    }
  };
};

// Handle Checkout - Goes to /checkout page
export const handleCheckout = () => {
  return (dispatch, getState) => {
    const authenticated = getState().authentication.authenticated;
    const cartItems = getState().cart.cartItems;

    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
      const errorOptions = {
        title: 'Cart is empty',
        message: 'Please add items to cart before checkout',
        position: 'tr',
        autoDismiss: 2
      };
      dispatch(success(errorOptions));
      return;
    }

    if (!authenticated) {
      // If not logged in, show message and redirect to login
      const successfulOptions = {
        title: 'Please Login',
        message: 'You need to login to proceed to checkout',
        position: 'tr',
        autoDismiss: 2
      };

      dispatch(toggleCart());
      dispatch(push('/login'));
      dispatch(success(successfulOptions));
    } else {
      // If logged in, close cart and go to checkout
      dispatch(toggleCart());
      dispatch(push('/checkout'));
    }
  };
};

// Place Order function - Creates cart on backend and processes order
export const placeOrder = () => {
  return async (dispatch, getState) => {
    try {
      const authenticated = getState().authentication.authenticated;
      const cartItems = getState().cart.cartItems;

      // Check if cart is empty
      if (!cartItems || cartItems.length === 0) {
        const errorOptions = {
          title: 'Cart is empty',
          message: 'Please add items to cart before placing order',
          position: 'tr',
          autoDismiss: 2
        };
        dispatch(success(errorOptions));
        return;
      }

      if (!authenticated) {
        // If not logged in, redirect to login
        const successfulOptions = {
          title: 'Please Login',
          message: 'You need to login to place an order',
          position: 'tr',
          autoDismiss: 2
        };

        dispatch(toggleCart());
        dispatch(push('/login'));
        dispatch(success(successfulOptions));
        return;
      }

      // Create cart on backend
      await dispatch(getCartId());

      // Navigate to checkout
      dispatch(toggleCart());
      dispatch(push('/checkout'));

    } catch (error) {
      handleError(error, dispatch);
    }
  };
};

// Continue shopping use case
export const handleShopping = () => {
  return (dispatch, getState) => {
    dispatch(toggleCart());
    dispatch(push('/shop'));
  };
};
// Simple version for product listings
export const handleAddToCartSimple = (product) => {
  return (dispatch, getState) => {
    // Validate required fields
    if (!product._id || !product.name || !product.price) {
      // Show error
      return;
    }

    // Prepare cart product with quantity 1
    const cartProduct = {
      _id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      totalPrice: product.price,
      taxable: product.taxable !== undefined ? product.taxable : true,
      // ... other fields
    };

    // Get cart from localStorage
    const cartItems = JSON.parse(localStorage.getItem(CART_ITEMS)) || [];

    // Check if product already exists
    const existingIndex = cartItems.findIndex(item => item._id === cartProduct._id);

    if (existingIndex !== -1) {
      // Increase quantity
      cartItems[existingIndex].quantity += 1;
      cartItems[existingIndex].totalPrice =
        cartItems[existingIndex].quantity * cartItems[existingIndex].price;
    } else {
      // Add new product
      cartItems.push(cartProduct);
    }

    // Save to localStorage
    localStorage.setItem(CART_ITEMS, JSON.stringify(cartItems));

    // Update Redux
    dispatch({ type: ADD_TO_CART, payload: cartProduct });

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    localStorage.setItem(CART_TOTAL, total.toFixed(2));
    dispatch({ type: HANDLE_CART_TOTAL, payload: parseFloat(total.toFixed(2)) });

    // Show cart and notification
    dispatch(toggleCart());
    dispatch(success({
      title: '✅ Added to Cart!',
      message: `${product.name} added`,
      position: 'tr',
      autoDismiss: 2
    }));
  };
};
// Create cart id on backend
export const getCartId = () => {
  return async (dispatch, getState) => {
    try {
      const cartId = localStorage.getItem(CART_ID);
      const cartItems = getState().cart.cartItems;

      // Don't create cart if already exists or cart is empty
      if (cartId || !cartItems || cartItems.length === 0) {
        return;
      }

      const products = getCartItems(cartItems);

      console.log('Creating cart on backend with products:', products);

      // Create cart on backend
      const response = await axios.post(`${API_URL}/cart/add`, { products });

      console.log('Cart created successfully:', response.data);

      dispatch(setCartId(response.data.cartId));

      return response.data.cartId;
    } catch (error) {
      console.error('Error creating cart:', error);
      handleError(error, dispatch);
      throw error;
    }
  };
};

export const setCartId = cartId => {
  return (dispatch, getState) => {
    localStorage.setItem(CART_ID, cartId);
    dispatch({
      type: SET_CART_ID,
      payload: cartId
    });
  };
};

export const clearCart = () => {
  return (dispatch, getState) => {
    localStorage.removeItem(CART_ITEMS);
    localStorage.removeItem(CART_TOTAL);
    localStorage.removeItem(CART_ID);

    dispatch({
      type: CLEAR_CART
    });

    const successOptions = {
      title: 'Cart cleared',
      position: 'tr',
      autoDismiss: 1
    };
    dispatch(success(successOptions));
  };
};

// Helper function to format cart items for backend
const getCartItems = cartItems => {
  return cartItems.map(item => ({
    quantity: item.quantity,
    price: item.price,
    taxable: item.taxable,
    product: item._id
  }));
};

// Helper function to calculate max purchase quantity based on inventory
const calculatePurchaseQuantity = inventory => {
  if (inventory <= 25) {
    return 1;
  } else if (inventory > 25 && inventory <= 100) {
    return 5;
  } else if (inventory > 100 && inventory < 500) {
    return 25;
  } else {
    return 50;
  }
};