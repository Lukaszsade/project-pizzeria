import { select, settings, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './AmountWidget.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

  }

  getData(){
    const thisBooking = this;

    const params = {
      booking: [
        'abc=xyz', 'lorem=ipsum'
      ],
      eventsCurrent: [

      ],
      eventsRepeat: [

      ],
    };

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'), 
      eventsCurrent: settings.db.url + '/' + settings.db.event 
                                     + '?' + params.eventsCurrent.join('&'), 
      eventsRepeat:  settings.db.url + '/' + settings.db.event 
                                     + '?' + params.eventsRepeat.join('&'), 
    };
    console.log('urls: ', urls);
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(); 
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount); 
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    console.log('thisBooking: ', thisBooking);
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.amountWidgets = [];
    thisBooking.amountWidgets.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidgets.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    //thisBooking.amountWidgets.addEventListener('updated', function(event) {

    //});

  
  }
}

export default Booking;