/**
 *
 * Shop
 *
 */

import React from 'react';

import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { Row, Col } from 'reactstrap';

import actions from '../../actions';
import { sortOptions } from '../../utils/store';

import ProductsShop from '../ProductsShop';
import BrandsShop from '../BrandsShop';
import CategoryShop from '../CategoryShop';

import Page404 from '../../components/Common/Page404';
import ProductFilter from '../../components/Store/ProductFilter';
import Pagination from '../../components/Common/Pagination';
import SelectOption from '../../components/Common/SelectOption';

class Shop extends React.PureComponent {
  componentDidMount() {
    document.body.classList.add('shop-page');
  }

  componentWillUnmount() {
    document.body.classList.remove('shop-page');
  }

  render() {
    const { products, advancedFilters, filterProducts } = this.props;
    const { totalPages, currentPage, count, limit, order } = advancedFilters;
    const displayPagination = totalPages > 1;
    const totalProducts = products.length;
    const left = limit * (currentPage - 1) + 1;
    const right = totalProducts + left - 1;

    return (
      <div className='shop'>
        <Row xs='12'>

          <Switch>
            <Route exact path='/shop' component={ProductsShop} />
            <Route path='/shop/category/:slug' component={CategoryShop} />
            <Route path='/shop/brand/:slug' component={BrandsShop} />
            <Route path='*' component={Page404} />
          </Switch>

          {displayPagination && (
            <div className='d-flex justify-content-center text-center mt-4'>
              <Pagination
                totalPages={totalPages}
                onPagination={filterProducts}
              />
            </div>
          )}

        </Row>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    advancedFilters: state.product.advancedFilters,
    products: state.product.storeProducts
  };
};

export default connect(mapStateToProps, actions)(Shop);
