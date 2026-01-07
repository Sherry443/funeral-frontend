/**
 *
 * ProductList - Fixed Add to Cart behavior
 *
 */

import React from 'react';
import { Link } from 'react-router-dom';
import AddToWishList from '../AddToWishList';

const ProductList = props => {
  const { products, updateWishlist, authenticated, handleAddToCart } = props;

  const onAddToCart = (e, product) => {
    // Stop all event propagation
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    console.log('🛒 ProductList - Adding to cart:', product);

    if (handleAddToCart) {
      // Add default quantity of 1 to the product
      const productWithQuantity = {
        ...product,
        quantity: 1
      };

      handleAddToCart(productWithQuantity);
    } else {
      console.warn('⚠️ handleAddToCart prop not provided to ProductList');
    }
  };

  return (
    <div className='product-list'>
      {products.map((product, index) => (
        <div key={index} className='mb-3 mb-md-0'>
          <div className='product-container'>
            <div className='item-box'>
              <div className='add-wishlist-box'>
                <AddToWishList
                  id={product._id}
                  liked={product?.isLiked ?? false}
                  enabled={authenticated}
                  updateWishlist={updateWishlist}
                  authenticated={authenticated}
                />
              </div>

              <div className='item-link'>
                {/* Product Image and Details - Clickable Link */}
                <Link
                  to={`/product/${product.slug || product._id}`}
                  className='d-flex flex-column'
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className='item-image-container'>
                    <div className='item-image-box'>
                      <img
                        className='item-image'
                        src={`${product.imageUrl
                            ? product.imageUrl
                            : product.images && product.images[0]
                              ? product.images[0].url
                              : '/images/placeholder-image.png'
                          }`}
                        alt={product.name}
                      />
                    </div>
                  </div>
                  <div className='item-body'>
                    <div className='item-details p-3'>
                      <h1 className='item-name'>{product.name}</h1>
                      {product.brand && Object.keys(product.brand).length > 0 && (
                        <p className='by'>
                          By <span>{product.brand.name}</span>
                        </p>
                      )}
                      <p className='item-desc mb-0'>{product.description}</p>
                    </div>
                  </div>
                  <div className='d-flex flex-row justify-content-between align-items-center px-4 mb-2 item-footer'>
                    <p className='price mb-0'>${product.price}</p>
                    {product.totalReviews > 0 && (
                      <p className='mb-0'>
                        <span className='fs-16 fw-normal mr-1'>
                          {parseFloat(product?.averageRating).toFixed(1)}
                        </span>
                        <span
                          className={`fa fa-star ${product.totalReviews !== 0 ? 'checked' : ''
                            }`}
                          style={{ color: '#ffb302' }}
                        ></span>
                      </p>
                    )}
                  </div>
                </Link>

                {/* Add to Cart Button - OUTSIDE Link */}
                <div className='px-3 pb-3'>
                  <button
                    onClick={(e) => onAddToCart(e, product)}
                    className='btn btn-block add-to-cart-btn'
                    type='button'
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '15px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }}
                  >
                    <span>🛒</span>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;