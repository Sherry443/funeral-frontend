/**
 *
 * Navigation
 *
 */

import React from 'react';

import { connect } from 'react-redux';
import { Link, NavLink as ActiveLink, withRouter } from 'react-router-dom';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from 'autosuggest-highlight/match';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';
import logo from "../../../public/images/logo.png"
import "./Navigation.css"
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

import actions from '../../actions';

import Button from '../../components/Common/Button';
import CartIcon from '../../components/Common/CartIcon';
import { BarsIcon } from '../../components/Common/Icon';
import MiniBrand from '../../components/Store//MiniBrand';
import Menu from '../NavigationMenu';
import Cart from '../Cart';

class Navigation extends React.PureComponent {
  componentDidMount() {
    this.props.fetchStoreBrands();
    this.props.fetchStoreCategories();
  }

  toggleBrand() {
    this.props.fetchStoreBrands();
    this.props.toggleBrand();
  }

  toggleMenu() {
    this.props.fetchStoreCategories();
    this.props.toggleMenu();
  }

  getSuggestionValue(suggestion) {
    return suggestion.name;
  }

  renderSuggestion(suggestion, { query, isHighlighted }) {
    const BoldName = (suggestion, query) => {
      const matches = AutosuggestHighlightMatch(suggestion.name, query);
      const parts = AutosuggestHighlightParse(suggestion.name, matches);

      return (
        <div>
          {parts.map((part, index) => {
            const className = part.highlight
              ? 'react-autosuggest__suggestion-match'
              : null;
            return (
              <span className={className} key={index}>
                {part.text}
              </span>
            );
          })}
        </div>
      );
    };

    return (
      <Link to={`/product/${suggestion.slug}`}>
        <div className='d-flex'>
          <img
            className='item-image'
            src={`${suggestion.imageUrl
              ? suggestion.imageUrl
              : '/images/placeholder-image.png'
              }`}
          />
          <div>
            <Container>
              <Row>
                <Col>
                  <span className='name'>{BoldName(suggestion, query)}</span>
                </Col>
              </Row>
              <Row>
                <Col>
                  <span className='price'>${suggestion.price}</span>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </Link>
    );
  }

  render() {
    const {
      history,
      authenticated,
      user,
      cartItems,
      brands,
      categories,
      signOut,
      isMenuOpen,
      isCartOpen,
      isBrandOpen,
      toggleCart,
      toggleMenu,
      searchValue,
      suggestions,
      onSearch,
      onSuggestionsFetchRequested,
      onSuggestionsClearRequested
    } = this.props;

    const inputProps = {
      placeholder: 'Search Products',
      value: searchValue,
      onChange: (_, { newValue }) => {
        onSearch(newValue);
      }
    };

    return (
      <header className='header fixed-mobile-header'>
        {/* Top bar with contact info and social icons */}
        <div className='header-top-bar'>
          <Container style={{ maxWidth: '90vw', width: '90vw' }}>
            <Row className='align-items-center'>
              <Col md='6' className='text-left d-none d-md-block'>
                <span className='top-bar-contact'>
                  <i className='fa fa-phone' style={{ marginRight: '8px' }} />
                  For Immediate Support: 1-605-787-3940
                </span>
              </Col>
              <Col md='6' className='text-right d-none d-md-block'>
                <div className='top-bar-icons'>
                  <a href='#' className='top-bar-icon' aria-label='Google'>
                    <i className='fa fa-google' />
                  </a>
                  <a href='#' className='top-bar-icon' aria-label='Email'>
                    <i className='fa fa-envelope' />
                  </a>
                  <a href='#' className='top-bar-icon' aria-label='Print'>
                    <i className='fa fa-print' />
                  </a>
                  <a href='#' className='top-bar-icon' aria-label='Facebook'>
                    <i className='fa fa-facebook' />
                  </a>
                </div>
              </Col>
              <Col xs='12' className='text-center d-block d-md-none py-2'>
                <i className='fa fa-phone' />
                <span> For Support: 1-605-787-3940</span>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Main navigation */}
        <div className='header-main-nav'>
          <Container style={{ maxWidth: '90vw', width: '90vw' }}>
            <Row className='align-items-center'>
              {/* Left Navigation */}
              <Col md='3' lg='4' className='d-none d-md-block'>
                <Nav className='main-nav-left'>
                  <NavItem>
                    <NavLink
                      tag={ActiveLink}
                      to='/'
                      exact
                      activeClassName='active'
                      className='nav-link-custom'
                    >
                      HOME
                    </NavLink>
                  </NavItem>
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className='nav-link-custom'>
                      OBITUARIES
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>Recent Obituaries</DropdownItem>
                      <DropdownItem>Search Obituaries</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className='nav-link-custom'>
                      ABOUT US
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>Our Story</DropdownItem>
                      <DropdownItem>Our Team</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </Nav>
              </Col>

              {/* Center Logo */}
              <Col xs='12' md='6' lg='4' className='text-center py-3 py-md-2'>
                <Link to='/' className='center-logo-link'>

                  {/* Add your logo image here if available */}
                  <img src={logo} alt='MERN Store' className='center-logo-img' />
                </Link>
              </Col>

              {/* Right Navigation */}
              <Col md='3' lg='4' className='d-none d-md-block'>
                <Nav className='main-nav-right'>
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className='nav-link-custom'>
                      SERVICES
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem onClick={() => history.push('/shop')}>
                        Shop
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <NavItem>
                    <NavLink
                      tag={ActiveLink}
                      to='/location'
                      activeClassName='active'
                      className='nav-link-custom'
                    >
                      LOCATION
                    </NavLink>
                  </NavItem>
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className='nav-link-custom'>
                      RESOURCES
                    </DropdownToggle>
                    <DropdownMenu right>
                      {brands && brands.length > 0 && (
                        <>
                          <DropdownItem header>Brands</DropdownItem>
                          {brands.slice(0, 5).map((brand, index) => (
                            <DropdownItem
                              key={index}
                              onClick={() => history.push(`/shop?brand=${brand.slug}`)}
                            >
                              {brand.name}
                            </DropdownItem>
                          ))}
                          <DropdownItem divider />
                        </>
                      )}
                      {authenticated ? (
                        <>
                          <DropdownItem onClick={() => history.push('/dashboard')}>
                            Dashboard
                          </DropdownItem>
                          <DropdownItem onClick={signOut}>Sign Out</DropdownItem>
                        </>
                      ) : (
                        <>
                          <DropdownItem onClick={() => history.push('/login')}>
                            Login
                          </DropdownItem>
                          <DropdownItem onClick={() => history.push('/register')}>
                            Sign Up
                          </DropdownItem>
                        </>
                      )}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <NavItem className='cart-nav-item'>
                    <CartIcon
                      cartItems={cartItems}
                      onClick={toggleCart}
                    />
                  </NavItem>
                </Nav>
              </Col>
            </Row>
          </Container>
        </div>
        {/* Mobile Navigation */}
        <div className='mobile-nav d-block d-md-none'>
          <Container>
            <Row className='align-items-center py-2'>
              <Col xs='3'>
                <Button
                  borderless
                  variant='empty'
                  ariaLabel='open the menu'
                  icon={<BarsIcon />}
                  onClick={() => this.toggleMenu()}
                />
              </Col>
              <Col xs='6' className='text-center'>
              </Col>
              <Col xs='3' className='text-right'>
                <CartIcon cartItems={cartItems} onClick={toggleCart} />
              </Col>
            </Row>
          </Container>
        </div>

        {/* Search bar */}
        {/* <div className='header-search'>
          <Container>
            <Row>
              <Col xs='12' lg={{ size: 6, offset: 3 }} className='py-2'>
                <Autosuggest
                  suggestions={suggestions}
                  onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={onSuggestionsClearRequested}
                  getSuggestionValue={this.getSuggestionValue}
                  renderSuggestion={this.renderSuggestion}
                  inputProps={inputProps}
                  onSuggestionSelected={(_, item) => {
                    history.push(`/product/${item.suggestion.slug}`);
                  }}
                />
              </Col>
            </Row>
          </Container>
        </div> */}

        {/* hidden cart drawer */}
        <div
          className={isCartOpen ? 'mini-cart-open' : 'hidden-mini-cart'}
          aria-hidden={`${isCartOpen ? false : true}`}
        >
          <div className='mini-cart'>
            <Cart />
          </div>
          <div
            className={
              isCartOpen ? 'drawer-backdrop dark-overflow' : 'drawer-backdrop'
            }
            onClick={toggleCart}
          />
        </div>

        {/* hidden menu drawer */}
        <div
          className={isMenuOpen ? 'mini-menu-open' : 'hidden-mini-menu'}
          aria-hidden={`${isMenuOpen ? false : true}`}
        >
          <div className='mini-menu'>
            <Menu />
          </div>
          <div
            className={
              isMenuOpen ? 'drawer-backdrop dark-overflow' : 'drawer-backdrop'
            }
            onClick={toggleMenu}
          />
        </div>
      </header>
    );
  }
}

const mapStateToProps = state => {
  return {
    isMenuOpen: state.navigation.isMenuOpen,
    isCartOpen: state.navigation.isCartOpen,
    isBrandOpen: state.navigation.isBrandOpen,
    cartItems: state.cart.cartItems,
    brands: state.brand.storeBrands,
    categories: state.category.storeCategories,
    authenticated: state.authentication.authenticated,
    user: state.account.user,
    searchValue: state.navigation.searchValue,
    suggestions: state.navigation.searchSuggestions
  };
};

export default connect(mapStateToProps, actions)(withRouter(Navigation));