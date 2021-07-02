import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js'; 

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
    console.log('thisCartProduct: ', thisCartProduct);
  }

  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {
      wrapper: element,
      amountWidget: element.querySelector(select.cartProduct.amountWidget),
      price: element.querySelector(select.cartProduct.price),
      edit: element.querySelector(select.cartProduct.edit),
      remove: element.querySelector(select.cartProduct.remove),
    };
  }

  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;  
    });
  }

  remove() {
    const thisCartProduct = this;
    const event = new CustomEvent('remove', {
      bubbles:true,
      detail: {//detail przekazuje dowolne info do handlera eventu
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
    console.log('wywołano remove');
  }

  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', function(event) {    
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function(event) {    
      event.preventDefault(); 
      thisCartProduct.remove();
    }); 
  }

  getData() {
    const thisCartProduct = this;

    const dataLoad ={
      id: thisCartProduct.id,
      name: thisCartProduct.name,
      params: thisCartProduct.params,
      amount: thisCartProduct.amount,
      priceSingle: thisCartProduct.priceSingle,
      price: thisCartProduct.price,
    };
    return dataLoad;
  }
}

export default CartProduct;