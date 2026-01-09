/**
 *
 * ProductsShop - Simplified Memorial Products View
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import actions from '../../actions';
import './ProductsShop.css';

class ProductsShop extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      obituaryId: null,
      filterType: null,
      selectedVariants: {} // Track selected variant for each product
    };
  }

  componentDidMount() {
    console.log('🛒 ProductsShop mounted');

    const searchParams = new URLSearchParams(window.location.search);
    const obituaryId = searchParams.get('obituaryId');
    const filterType = searchParams.get('filter');

    console.log('📋 URL Params:', { obituaryId, filterType });

    if (obituaryId) {
      this.setState({ obituaryId, filterType });
      console.log('🌳 Fetching memorial products for obituary:', obituaryId);
      this.props.fetchMemorialProducts(obituaryId, filterType || null);
    } else {
      const slug = this.props.match.params.slug;
      console.log('🛍️ Regular shop - filtering products:', slug);
      this.props.filterProducts(slug);
    }
  }

  componentDidUpdate(prevProps) {
    const searchParams = new URLSearchParams(window.location.search);
    const obituaryId = searchParams.get('obituaryId');

    if (obituaryId !== this.state.obituaryId) {
      this.componentDidMount();
    }
  }

  handleVariantChange = (productId, variantIndex) => {
    this.setState(prevState => ({
      selectedVariants: {
        ...prevState.selectedVariants,
        [productId]: variantIndex
      }
    }));
  }

  handleAddToCart = (product) => {
    const { selectedVariants, obituaryId } = this.state;
    const variantIndex = selectedVariants[product._id] || 0;
    const selectedVariant = product.variants[variantIndex];

    console.log('Adding to cart:', {
      product: product.name,
      variant: selectedVariant.name,
      price: selectedVariant.price,
      obituaryId
    });

    // Prepare complete product data for cart
    const cartProduct = {
      _id: product._id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      imageUrl: product.images && product.images.length > 0 ? product.images[0].url : null,
      imageKey: product.images && product.images.length > 0 ? product.images[0].key : null,
      price: selectedVariant.price,
      quantity: 1,
      taxable: product.taxable || false,
      isActive: product.isActive,
      variant: selectedVariant,
      variantIndex: variantIndex,
      // Memorial context if applicable
      obituaryId: obituaryId || null,
      memorialType: product.type || null
    };

    try {
      // Call the Redux action to add to cart
      this.props.handleAddToCart(cartProduct);

      // Show success message (optional)
      console.log('✅ Product added to cart successfully');

      // You can add a toast notification here if you have a notification system
      // For now, we'll just log it
    } catch (error) {
      console.error('❌ Error adding product to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    }
  }

  getSelectedVariant = (product) => {
    const { selectedVariants } = this.state;
    const variantIndex = selectedVariants[product._id] || 0;
    return product.variants[variantIndex];
  }

  render() {
    const { products, isLoading } = this.props;
    const { selectedVariants } = this.state;

    if (isLoading) {
      return (
        <div className="products-shop-loading">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className="products-shop-empty">
          <h3>No products found</h3>
          <p>Please check back later</p>
        </div>
      );
    }

    return (
      <div className="products-shop">
        <div className="products-grid">
          {products.map((product) => {
            // Validate product has required data
            if (!product._id || !product.name || !product.variants || product.variants.length === 0) {
              console.warn('Invalid product data:', product);
              return null;
            }

            const selectedVariant = this.getSelectedVariant(product);
            const imageUrl = product.images && product.images.length > 0
              ? product.images[0].url
              : 'https://via.placeholder.com/300x300?text=No+Image';

            return (
              <div key={product._id} className="product-card">
                <div className="product-image-wrapper">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>

                  {/* Variant Selector */}
                  {product.variants && product.variants.length > 1 && (
                    <div className="variant-selector">
                      <select
                        value={selectedVariants[product._id] || 0}
                        onChange={(e) => this.handleVariantChange(product._id, parseInt(e.target.value))}
                        className="variant-select"
                      >
                        {product.variants.map((variant, index) => (
                          <option key={index} value={index}>
                            {variant.name} - ${variant.price.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Price */}
                  <div className="product-price">
                    ${selectedVariant.price.toFixed(2)}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => this.handleAddToCart(product)}
                    className="add-to-cart-btn"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    products: state.product.storeProducts,
    isLoading: state.product.isLoading,
    authenticated: state.authentication.authenticated,
    cartItems: state.cart.cartItems
  };
};

export default connect(mapStateToProps, actions)(ProductsShop);