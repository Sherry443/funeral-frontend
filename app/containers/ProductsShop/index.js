/**
 *
 * ProductsShop - Updated with Memorial Products Support
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { TreePine, Flower, Gift, Heart } from 'lucide-react';
import actions from '../../actions';

import ProductList from '../../components/Store/ProductList';
import NotFound from '../../components/Common/NotFound';
import LoadingIndicator from '../../components/Common/LoadingIndicator';

class ProductsShop extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      obituaryId: null,
      filterType: null
    };
  }

  componentDidMount() {
    console.log('🛒 ProductsShop mounted');

    // Check if this is a memorial shop visit (from obituary page)
    const searchParams = new URLSearchParams(window.location.search);
    const obituaryId = searchParams.get('obituaryId');
    const filterType = searchParams.get('filter');

    console.log('📋 URL Params:', { obituaryId, filterType });

    if (obituaryId) {
      // Memorial products view
      this.setState({ obituaryId, filterType });
      console.log('🌳 Fetching memorial products for obituary:', obituaryId);
      this.props.fetchMemorialProducts(obituaryId, filterType || null);
    } else {
      // Regular shop view
      const slug = this.props.match.params.slug;
      console.log('🛍️ Regular shop - filtering products:', slug);
      this.props.filterProducts(slug);
    }
  }

  componentDidUpdate(prevProps) {
    // Handle navigation changes
    const searchParams = new URLSearchParams(window.location.search);
    const obituaryId = searchParams.get('obituaryId');

    if (obituaryId !== this.state.obituaryId) {
      this.componentDidMount();
    }
  }

  handleFilterChange = (type) => {
    const { obituaryId } = this.state;

    this.setState({ filterType: type });

    if (obituaryId) {
      console.log(`🔄 Filtering memorial products by type: ${type}`);
      this.props.fetchMemorialProducts(obituaryId, type);
    }
  }

  render() {
    const { products, isLoading, authenticated, updateWishlist } = this.props;
    const { obituaryId, filterType } = this.state;

    const displayProducts = products && products.length > 0;
    const isMemorialShop = !!obituaryId;

    return (
      <div className='products-shop'>
        {/* Memorial Banner */}
        {isMemorialShop && (
          <div className='memorial-banner mb-4'>
            <div className='bg-gradient-to-r from-green-800 to-green-700 rounded-lg p-6 text-white'>
              <div className='flex items-center gap-3 mb-3'>
                <TreePine size={32} />
                <div>
                  <h2 className='text-2xl font-semibold mb-1'>
                    Plant a Memorial Tree
                  </h2>
                  <p className='text-green-100'>
                    Honor their memory with a living tribute
                  </p>
                </div>
              </div>
              <p className='text-green-50 text-sm'>
                Each tree planted helps create a lasting legacy and supports reforestation efforts.
              </p>
            </div>
          </div>
        )}

        {/* Memorial Product Type Filters */}
        {isMemorialShop && (
          <div className='memorial-filters mb-4'>
            <div className='bg-white rounded-lg shadow-sm p-4'>
              <h3 className='text-sm font-semibold text-gray-700 mb-3'>Memorial Tributes</h3>
              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={() => this.handleFilterChange(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${!filterType
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Heart size={16} />
                  All Tributes
                </button>

                <button
                  onClick={() => this.handleFilterChange('tree')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${filterType === 'tree'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <TreePine size={16} />
                  Trees
                </button>

                <button
                  onClick={() => this.handleFilterChange('flower')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${filterType === 'flower'
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Flower size={16} />
                  Flowers
                </button>

                <button
                  onClick={() => this.handleFilterChange('gift')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${filterType === 'gift'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Gift size={16} />
                  Memorial Gifts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <LoadingIndicator />}

        {/* Products List */}
        {displayProducts && !isLoading && (
          <ProductList
            products={products}
            authenticated={authenticated}
            updateWishlist={updateWishlist}
          />
        )}

        {/* No Products Found */}
        {!isLoading && !displayProducts && (
          <div className='text-center py-12 bg-white rounded-lg shadow-sm'>
            {isMemorialShop ? (
              <div>
                <TreePine className='mx-auto text-gray-400 mb-3' size={48} />
                <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                  No memorial products available
                </h3>
                <p className='text-gray-500'>
                  Please check back later or contact us for custom memorial options.
                </p>
              </div>
            ) : (
              <NotFound message='No products found.' />
            )}
          </div>
        )}

        {/* Product Count */}
        {displayProducts && isMemorialShop && (
          <div className='mt-4 text-center text-sm text-gray-600'>
            Showing {products.length} memorial {filterType || 'tribute'}{products.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    products: state.product.storeProducts,
    isLoading: state.product.isLoading,
    authenticated: state.authentication.authenticated
  };
};

export default connect(mapStateToProps, actions)(ProductsShop);