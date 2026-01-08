/**
 *
 * ProductPage - With variant support and modern design
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import "./Product.css"

import actions from '../../actions';

import Button from '../../components/Common/Button';
import LoadingIndicator from '../../components/Common/LoadingIndicator';
import NotFound from '../../components/Common/NotFound';
import { BagIcon } from '../../components/Common/Icon';
import ProductReviews from '../../components/Store/ProductReviews';
import SocialShare from '../../components/Store/SocialShare';

class ProductPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedVariant: null,
      quantity: 1
    };
  }

  componentDidMount() {
    const identifier = this.props.match.params.slug;
    this.loadProduct(identifier);
    document.body.classList.add('product-page');
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.slug !== prevProps.match.params.slug) {
      const identifier = this.props.match.params.slug;
      this.loadProduct(identifier);
    }

    // Set default variant when product loads
    if (prevProps.product !== this.props.product && this.props.product.variants && this.props.product.variants.length > 0) {
      if (!this.state.selectedVariant) {
        this.setState({ selectedVariant: this.props.product.variants[0] });
      }
    }
  }

  componentWillUnmount() {
    document.body.classList.remove('product-page');
  }

  loadProduct(identifier) {
    console.log('📦 Loading product with identifier:', identifier);

    // Check if identifier is a MongoDB ObjectId (24 hex characters)
    const isMongoId = /^[a-f\d]{24}$/i.test(identifier);

    if (isMongoId) {
      console.log('🔑 Detected MongoDB ID, fetching by ID');
      this.props.fetchStoreProduct(identifier, true);
    } else {
      console.log('🏷️ Detected slug, fetching by slug');
      this.props.fetchStoreProduct(identifier, false);
      this.props.fetchProductReviews(identifier);
    }
  }

  handleVariantSelect = (variant) => {
    this.setState({ selectedVariant: variant });
  };

  handleQuantityChange = (change) => {
    this.setState(prevState => ({
      quantity: Math.max(1, prevState.quantity + change)
    }));
  };

  handleAddToCartWithVariant = () => {
    const { product, handleAddToCart } = this.props;
    const { selectedVariant, quantity } = this.state;

    if (!selectedVariant) {
      alert('Please select a variant');
      return;
    }

    // Create product with variant price
    const productWithPrice = {
      ...product,
      price: selectedVariant.price,
      selectedVariant: selectedVariant,
      variantId: selectedVariant._id,
      variantName: selectedVariant.name
    };

    // Update quantity in Redux state before adding to cart
    this.props.productShopChange('quantity', quantity);

    // Add to cart
    handleAddToCart(productWithPrice);
  };

  render() {
    const {
      isLoading,
      product,
      shopFormErrors,
      itemInCart,
      handleRemoveFromCart,
      addProductReview,
      reviewsSummary,
      reviews,
      reviewFormData,
      reviewChange,
      reviewFormErrors
    } = this.props;

    const { selectedVariant, quantity } = this.state;

    // Check if product has variants
    const hasVariants = product.variants && product.variants.length > 0;
    const displayPrice = hasVariants && selectedVariant ? selectedVariant.price : product.price;
    const originalPrice = displayPrice ? (displayPrice / 0.8).toFixed(2) : 0;

    return (
      <div className='product-shop'>
        {isLoading ? (
          <LoadingIndicator />
        ) : Object.keys(product).length > 0 ? (
          <>
            {/* Main Product Section */}
            <div className='modern-product-container'>
              <div className='product-grid'>
                {/* Left Column - Image */}
                <div className='product-image-section'>
                  <div className='product-image-wrapper'>
                    <img
                      className='product-main-image'
                      src={
                        product.imageUrl
                          ? product.imageUrl
                          : product.images && product.images[0]
                            ? product.images[0].url
                            : '/images/placeholder-image.png'
                      }
                      alt={product.name}
                    />
                    {product.inventory <= 0 && !shopFormErrors['quantity'] ? (
                      <p className='stock-badge out-of-stock'>Out of stock</p>
                    ) : (
                      <p className='stock-badge in-stock'>In stock</p>
                    )}
                  </div>

                  {/* Partnership Section */}
                  <div className='partnership-section'>
                    <p className='partnership-label'>In Partnership With:</p>
                    <div className='partnership-logo'>
                      <div className='logo-circle'>
                        <svg className='logo-icon' fill='currentColor' viewBox='0 0 24 24'>
                          <path d='M12 2L4 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-8-5z' />
                        </svg>
                      </div>
                    </div>
                    <p className='partnership-name'>
                      A TREE <span className='italic'>to</span> REMEMBER™
                    </p>
                  </div>
                </div>

                {/* Right Column - Product Details */}
                <div className='product-details-section'>
                  <div className='product-header'>
                    <h1 className='product-title'>{product.name}</h1>
                    <div className='product-pricing'>
                      {hasVariants && displayPrice && (
                        <>
                          <span className='price-original'>${originalPrice}</span>
                          <span className='price-current'>${displayPrice.toFixed(2)}</span>
                        </>
                      )}
                      {!hasVariants && product.price && (
                        <span className='price-current'>${product.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className='product-info'>
                    <p className='product-sku'>SKU: {product.sku}</p>
                    {product.brand && (
                      <p className='product-brand'>
                        See more from{' '}
                        <Link to={`/shop/brand/${product.brand.slug}`} className='brand-link'>
                          {product.brand.name}
                        </Link>
                      </p>
                    )}
                  </div>

                  {/* Description with highlights */}
                  <div className='product-description'>
                    {product.highlights && product.highlights.length > 0 ? (
                      <ul className='highlight-list'>
                        {product.highlights.map((highlight, index) => (
                          <li key={index} className='highlight-item'>
                            <span className='bullet'></span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{product.description}</p>
                    )}
                  </div>

                  {/* Variant Selection */}
                  {hasVariants && (
                    <div className='variant-selection'>
                      <div className='variant-grid'>
                        {product.variants.map((variant) => (
                          <button
                            key={variant._id}
                            onClick={() => this.handleVariantSelect(variant)}
                            className={`variant-button ${selectedVariant && selectedVariant._id === variant._id
                              ? 'variant-button-selected'
                              : ''
                              }`}
                          >
                            {variant.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className='quantity-section'>
                    <label className='quantity-label'>Quantity</label>
                    <div className='quantity-controls'>
                      <button
                        onClick={() => this.handleQuantityChange(-1)}
                        className='quantity-btn'
                      >
                        <span>−</span>
                      </button>
                      <input
                        type='number'
                        value={quantity}
                        onChange={(e) => this.setState({ quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                        className='quantity-input'
                        min='1'
                      />
                      <button
                        onClick={() => this.handleQuantityChange(1)}
                        className='quantity-btn'
                      >
                        <span>+</span>
                      </button>
                    </div>
                  </div>

                  {/* Social Share */}
                  <div className='social-share-section'>
                    <SocialShare product={product} />
                  </div>

                  {/* Add to Cart Button */}
                  <div className='cart-actions'>
                    {itemInCart ? (
                      <Button
                        variant='primary'
                        disabled={product.inventory <= 0 && !shopFormErrors['quantity']}
                        text='Remove From Bag'
                        className='cart-button'
                        icon={<BagIcon />}
                        onClick={() => handleRemoveFromCart(product)}
                      />
                    ) : (
                      <button
                        disabled={product.inventory <= 0 && !shopFormErrors['quantity']}
                        className='checkout-button'
                        onClick={this.handleAddToCartWithVariant}
                      >
                        CONTINUE TO CHECKOUT
                      </button>
                    )}
                  </div>

                  {/* Additional Product Info */}
                  <div className='product-meta'>
                    <div className='meta-grid'>
                      <div className='meta-item'>
                        <span className='meta-label'>Type:</span>
                        <span className='meta-value'>{product.type}</span>
                      </div>
                      <div className='meta-item'>
                        <span className='meta-label'>Status:</span>
                        <span className='meta-value status-active'>
                          {product.inventory > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <div className='meta-item'>
                        <span className='meta-label'>Taxable:</span>
                        <span className='meta-value'>{product.taxable ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            {hasVariants && (
              <div className='variant-details-section'>
                <h2 className='section-title'>Available Options</h2>
                <div className='variant-cards-grid'>
                  {product.variants.map((variant) => (
                    <div key={variant._id} className='variant-card'>
                      <h4 className='variant-card-name'>{variant.name}</h4>
                      <p className='variant-card-price'>${variant.price.toFixed(2)}</p>
                      {variant.quantity && (
                        <p className='variant-card-quantity'>
                          {variant.quantity} tree{variant.quantity > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {reviews && reviews.length > 0 && (
              <ProductReviews
                reviewFormData={reviewFormData}
                reviewFormErrors={reviewFormErrors}
                reviews={reviews}
                reviewsSummary={reviewsSummary}
                reviewChange={reviewChange}
                addReview={addProductReview}
              />
            )}


          </>
        ) : (
          <NotFound message='No product found.' />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const itemInCart = state.cart.cartItems.find(
    item => item._id === state.product.storeProduct._id
  )
    ? true
    : false;

  return {
    product: state.product.storeProduct,
    productShopData: state.product.productShopData,
    shopFormErrors: state.product.shopFormErrors,
    isLoading: state.product.isLoading,
    reviews: state.review.productReviews,
    reviewsSummary: state.review.reviewsSummary,
    reviewFormData: state.review.reviewFormData,
    reviewFormErrors: state.review.reviewFormErrors,
    itemInCart
  };
};

export default connect(mapStateToProps, actions)(ProductPage);