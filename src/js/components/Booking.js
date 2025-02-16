import { classNames, select, settings, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    
    thisBooking.selectedTableId = null;
  }

  getData() {
    const thisBooking = this;
    
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam   = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log('params: ', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'), 
      eventsCurrent: settings.db.url + '/' + settings.db.event 
                                     + '?' + params.eventsCurrent.join('&'), 
      eventsRepeat:  settings.db.url + '/' + settings.db.event 
                                     + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),  
    ])
      .then(function(allResponses) {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]); 
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        // console.log('bookings: ', bookings);
        // console.log('eventsCurrent: ', eventsCurrent);
        // console.log('eventsRepeat: ', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    
    for(let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat) {
      if(item.repeat == 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
    thisBooking.initTable();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
  
    if(typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
    
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
    
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      
      thisBooking.booked[date][hourBlock].push(table); 
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
  
    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }
    
    for(let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.booked);
      } else {
        table.classList.remove(classNames.booking.booked);
      }
    }
  
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
    thisBooking.dom.tablesWrapper = element.querySelector(select.booking.tablesWrapper);
    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
    thisBooking.dom.form = element.querySelector(select.booking.form);
  }

  initTable(clickedTable) {
    if(!clickedTable){
      return;
    }
    const thisBooking = this;
    const selectedTable = document.querySelector(select.booking.selectedTable);

    if(selectedTable && selectedTable != clickedTable.target) { 
      selectedTable.classList.remove(classNames.booking.selected);
      thisBooking.selectedTableId = null;
    }
    
    if(clickedTable.target.classList.contains(classNames.booking.table)) {
      if(!clickedTable.target.classList.contains(classNames.booking.booked)) {
        clickedTable.target.classList.toggle(classNames.booking.selected);
      
        if(clickedTable.target.classList.contains(classNames.booking.selected))  {
          thisBooking.selectedTableId = clickedTable.target.getAttribute('data-table');
          thisBooking.checkTableAvlbty(); 
        } else {
          thisBooking.selectedTableId = null;
        }
      } else {
        alert('Stolik jest zajęty!');
      }
    }

    console.log(thisBooking);
  }

  checkTableAvlbty() {
    const thisBooking = this;
    thisBooking.tableAvailability = false;
    
    thisBooking.duration = thisBooking.amountWidgets.hoursAmount.correctValue;

        
    // każdy blok wybranego czasu rezerwacji ma być miejszy niż suma wybranej godziny i czasu trwania 
    for(let pickedHour = thisBooking.hour; pickedHour < thisBooking.hour + thisBooking.duration; pickedHour += 0.5) {
      
      //przechodzimy po każdej zarezerwowanej w danym dniu godzinie
      // sparwdzamy czy pickedhour znajduje sie w zabukowanych godzinachbooked.
      // console.log('thisBooking.booked[thisBooking.date].includes(pickedHour): ', thisBooking.booked[thisBooking.date].contains(pickedHour));     
      
      for(let hour in thisBooking.booked[thisBooking.date]) {
        
        hour = parseInt(hour);
        const clickedTable = parseInt(thisBooking.selectedTableId);
        const bookedTable = thisBooking.booked[thisBooking.date][hour];
        
        if(hour == pickedHour && bookedTable.includes(clickedTable)) {
          console.log('hour: ', hour);
          console.log('pickedHour: ', pickedHour);
          console.log('bookedTable: ', bookedTable);
          console.log('clickedTable: ', clickedTable);
          console.log('stolik jest zajęty od godziny ', hour);
          
          alert('Skróć czas rezerwacji! Ten stolik nie jest dostępny w wybranych godzinach.');
          thisBooking.tableAvailability = false;
          
        } else {
          console.log('Stolik dostępny dla godziny ', pickedHour);
          thisBooking.tableAvailability = true;
        }
      }
    }
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.amountWidgets = [];
    thisBooking.amountWidgets.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidgets.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    
    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
      thisBooking.initTable();
    });
   
    thisBooking.dom.tablesWrapper.addEventListener('click', function(event) {
      event.preventDefault();
      thisBooking.initTable(event);
    });

    thisBooking.dom.form.addEventListener('updated', function(event) {
      event.preventDefault();
      
      const selectedTable = document.querySelector(select.booking.selectedTable);

      if(selectedTable) { 
        selectedTable.classList.remove(classNames.booking.selected);
        thisBooking.selectedTableId = null;
      }
    });

    thisBooking.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const formData = utils.serializeFormToObject(thisBooking.dom.form);
    
    const payload = {
      date: formData.date,
      hour: thisBooking.hourPicker.correctValue,
      table: parseInt(thisBooking.selectedTableId),
      duration: parseInt(formData.hours),
      ppl: parseInt(formData.people),
      starters: [],
      phone: formData.phone,
      address: formData.address,
    };
    
    payload.starters.push(formData.starter);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }; 

    fetch(url, options);
    
    thisBooking.makeBooked(formData.date, thisBooking.hourPicker.correctValue, payload.duration, payload.table);
    console.log('thisBooking.booked: ', thisBooking.booked);
  
  }
}

export default Booking;