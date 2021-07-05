import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();

  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(); 
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount); 
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    console.log('thisBooking: ', thisBooking);
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.amountWidgets = [];
    thisBooking.amountWidgets.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidgets.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    //thisBooking.amountWidgets.addEventListener('updated', function(event) {

    //});

  
  }
}

export default Booking;