(() => {
  const day = {
    initialize() {
      // Create new url object
      this.url = new URL(document.URL);
      // Get the day, or set default value.
      this.setDay = this.url.searchParams.get('day') ?? '19';

      // Create new instance of the Ghent API
      this.GhentApi = new GhentApi();

      this.cacheElements();
      this.addEventListeners();
      this.setActiveDay();
      this.fetchCategories();
    },
    cacheElements() {
      this.$days = document.querySelectorAll('header .days li');
      this.$events = document.querySelector('#day__events');
      this.$dayStyles = document.querySelector('.day_styles');
      this.$dayMenuBody = document.querySelector('.days-menu_body');
      this.$dayMenuItems = document.querySelector('.selection-menu-items');
      this.$dayMenuButtons = document.querySelectorAll('.selection-menu-items button');
      this.$dayStyleGrid = document.querySelector('#day_style_grid');
      this.$dayStyleList = document.querySelector('#day_style_list');
    },
    addEventListeners() {
      this.$dayStyles.addEventListener('click', (ev) => {
        if (!ev.target.classList.contains('active') && ev.target.id) {
          this.$events.classList.toggle('list_style');
          this.$dayStyleGrid.classList.toggle('active');
          this.$dayStyleList.classList.toggle('active');
        }
      });

      this.$dayMenuItems.addEventListener('click', (ev) => {
        if (!ev.target.classList.contains('active') && ev.target.nodeName === 'BUTTON') {
          this.$dayMenuButtons.forEach(button => {
            if (button.classList.contains('active')) button.classList.toggle('active');
          });
          ev.target.classList.toggle('active');
          switch (ev.target.id) {
            case 'category':
              this.setCategories();
              break;
            case 'organizer':
              this.setOrganizers();
              break;
            default:
              this.$dayMenuBody.innerHTML = '<span class="txt__bold">Not yet implemented :D</span>';
          }
        }
      });
    },
    setActiveDay() {
      this.$days.forEach(day => {
        day.classList.remove('active');
        if (day.id === `day_${this.setDay}`) {
          day.classList.add('active');
        }
      });
    },
    async fetchCategories() {
      this.categories = await this.GhentApi.getCategories();
      this.$dayMenuButtons[0].classList.add('active');
      this.setCategories();

      this.fetchEvents();
    },
    setCategories() {
      this.$dayMenuBody.innerHTML = this.categories.map(c => `
        <li>
          <a class="x" href="events/day.html?day=${this.setDay}#${c}">${c}</a>
        </li>`).join('');
    },
    setOrganizers() {
      this.organizers = [
        'Camping Vlasmarkt',
        'cirQ Chataclan',
        'Groentenmarkt',
        'Korenmarkt',
        'Luisterplein',
        'Sint-Veerleplein',
        'Trefpunt',
        'Andere activiteiten'
      ];
      this.$dayMenuBody.innerHTML = this.organizers.map(o => `
        <li>
          <a class="x" href="events/day.html?day=${this.setDay}#${o}">${o}</a>                
        </li>`).join('');
    },
    async fetchEvents() {
      this.allEvents = await this.GhentApi.getEvents();
      this.allEvents.sort((a, b) => a.sort_key - b.sort_key);
      this.getEvents();
    },
    getEvents() {
      this.events = this.allEvents.filter(e => e.day === this.setDay);
      this.eventsPerCategorie = {};
      this.categories.forEach(c => this.eventsPerCategorie[c] = this.events.filter(e => e.category.includes(c)));
      this.setEvents();
    },
    setEvents() {
      // Get html for events.
      const htmlForEvents = this.categories.map(c => {
        // First map the events, per category
        const eventsOfCategory = this.eventsPerCategorie[c].map(e => {
          // Check if image exist else set default.
          const image = e.image?.thumb ?? 'static/media/images/more-red_1.jpg';

          // Return data.
          return `
            <li class="day__events__item" id="${e.id}">
              <a class="x" href="events/detail.html?day=${e.day}&event=${e.slug}">
                <img src="${image}" alt="${e.slug}" loading="lazy">
                <div class="events__wrapper">
                  <span class="events__date txt__bold">${e.start} u.</span>
                  <h4>${e.title}</h4>
                  <span class="event__location">${e.location}</span>
                </div>
              </a>
            </li>`;
        }).join('');

        // If no data stop.
        if (!eventsOfCategory.length) return '';

        // Return name + data.
        return `
        <li id="${c}">
            <span class="flex">
                <h3>${c}</h3>
                <a class="x icon days_category__arrow-up" href="events/day.html#home"></a>
            </span>
            <ul class="day__events__items">${eventsOfCategory}</ul>
        </li>`;
      }).join('');

      // Set error message
      const errorMsg = `
        <div>
          <h2 class="txt__center">Oh no! We did not find any data!</h2>
          <p class="txt__center">Have you tried using/searching a day between 19 and 28?</p>
        </div>`;

      // Set html to needs.
      this.$events.innerHTML = htmlForEvents === '' ? errorMsg : htmlForEvents;
    },
  };
  // Start initialization.
  day.initialize();
})();