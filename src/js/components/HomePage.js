import { templates } from '../settings.js';

class HomePage {
  constructor (element) {
    const thisHP = this;

    thisHP.render(element);
  }



  render(element) {
    const thisHP = this;

    const generatedHtml = templates.homePage();
    thisHP.dom = {};
    thisHP.dom.wrapper = element;
    thisHP.dom.wrapper.innerHTML = generatedHtml;
  }
}

export default HomePage;