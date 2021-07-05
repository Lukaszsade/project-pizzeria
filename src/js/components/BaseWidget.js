
class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctvalue = initialValue;
    
    console.log('thisWidget.correctvalue: ', thisWidget.correctvalue);
  }
  
  setValue(value) {
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);

    if(thisWidget.correctvalue != newValue 
      && thisWidget.isValid(newValue)) { 
      thisWidget.correctvalue = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }
  
  parseValue(value) {
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value);    
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.correctvalue;
    console.log('wyrenderowano: ', thisWidget.correctvalue);
  }
  
  announce() {
    const thisWidget = this;
    
    const event = new CustomEvent('updated', {
      bubbles:true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;