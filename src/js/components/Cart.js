import {select, classNames, templates, settings} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;
    
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();  
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger); 
    thisCart.dom.productList = element.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
    thisCart.dom.subTotalPrice = element.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
    thisCart.dom.form = element.querySelector(select.cart.form);
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function() {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function() {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(generatedDOM);
    console.log('menuProduct: ', menuProduct);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    console.log('generatedDOM: ', generatedDOM);
    console.log('thisCart.products: ', thisCart.products);
    thisCart.update();
  }

  update() {
    const thisCart = this;
    
    const deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subTotalPrice = 0;
    thisCart.totalPrice = 0;
    
    for(let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subTotalPrice += product.price;
    }
    if(thisCart.totalNumber && thisCart.totalNumber > 0) {
      thisCart.totalPrice = thisCart.subTotalPrice + deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    } else {
      thisCart.dom.deliveryFee.innerHTML = 0;
      thisCart.totalPrice = 0;
    }
    for(let selector of thisCart.dom.totalPrice) {
      selector.innerHTML = thisCart.totalPrice;
    } 
    thisCart.dom.subTotalPrice.innerHTML = thisCart.subTotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    
    console.log('thisCart: ', thisCart); 
  }

  remove(cartProduct) {
    const thisCart = this;
    
    const removeDOMProduct = cartProduct.dom.wrapper;
    removeDOMProduct.remove();
    const indexOfProduct = thisCart.products.indexOf(cartProduct);
    const removedProduct = thisCart.products.splice(indexOfProduct, 1);
    console.log('removedProduct: ', removedProduct);

    thisCart.update();
  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const formData = utils.serializeFormToObject(thisCart.dom.form);
    console.log('formData: ', formData);
    
    const payload = {
      phone: formData.phone,
      address: formData.address,
      totalPrice: thisCart.totalPrice,
      subTotalPrice: thisCart.totalPrice - settings.cart.defaultDeliveryFee,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: [],
    };
    console.log('payload: ', payload);
    
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    } 

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }; 

    fetch(url, options);
  }
}

export default Cart;