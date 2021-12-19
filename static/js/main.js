(() => {
  const app = {
    init() {
      this.cacheElements();
      this.eventListeners();
      this.fetchWeather().then((r) => this.updateWeather(r));
      this.fetchGhentCovidPositiveCases().then((r) =>
        this.updateGhentCovidPositiveCases(r)
      );
    },
    cacheElements() {
      this.$openers = document.querySelectorAll(".opener");
      this.$closers = document.querySelectorAll(".closer");
      this.$asides = document.querySelectorAll("main > aside");
      this.$content = document.querySelector("main > section.content");
      this.$weather = document.querySelector(".weather");
      this.$covidCases = document.querySelector(".covid-cases");
    },
    eventListeners() {
      // Openers events
      this.$openers.forEach((opener) => {
        const dsParent = opener.dataset.parent;
        let otherOpener, closer;
        if (dsParent === "pgm-team") {
          otherOpener = document.querySelector(`.opener_right`);
          closer = document.querySelector(".closer:not(.closer_right)");
        } else if (dsParent === "github-users") {
          otherOpener = document.querySelector(`.opener:not(.opener_right)`);
          closer = document.querySelector(".closer_right");
        }
        const parent = document.querySelector(`#${opener.dataset.parent}`);
        opener.addEventListener("click", (ev) => {
          if (ev.target.classList.contains("opener_right")) {
            otherOpener.style.left = "-20rem";
            parent.style = "right: 0";
            closer.style.left = "calc(100% - 21.8rem)";
          } else {
            otherOpener.style.left = "calc(100% + 20rem)";
            parent.style = "left: 0";
            closer.style.left = "18.5rem";
          }
        });
      });

      // Closer events
      this.$closers.forEach((closer) => {
        const dsParent = closer.dataset.parent;
        let otherOpener;
        if (dsParent === "pgm-team") {
          otherOpener = document.querySelector(`.opener_right`);
        } else if (dsParent === "github-users") {
          otherOpener = document.querySelector(`.opener:not(.opener_right)`);
        }
        const parent = document.querySelector(`#${closer.dataset.parent}`);
        closer.addEventListener("click", (ev) => {
          otherOpener.style.left = parent.style = closer.style.left = "";
        });
      });
    },
    async fetchWeather(city) {
      const weatherApi = new WeatherApi();
      return await weatherApi.getCurrentWeather(city);
    },
    updateWeather(weatherData) {
      this.$weather.innerHTML = weatherData.current.temp_c;
    },
    async fetchGhentCovidPositiveCases() {
      const ghentApi = new GhentOpenDataApi();
      return await ghentApi.getCovidPositiveCases();
    },
    updateGhentCovidPositiveCases(covidCases) {
      this.$covidCases.innerHTML = covidCases.records[0].fields.cases;
    },
  };
  app.init();
})();
