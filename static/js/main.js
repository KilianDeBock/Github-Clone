(() => {
  const app = {
    init() {
      this.cacheElements();
      this.eventListeners();
      this.fetchWeather().then((r) => this.updateWeather(r));
    },
    cacheElements() {
      this.$openers = document.querySelectorAll(".opener");
      this.$asides = document.querySelectorAll("main > aside");
      this.$content = document.querySelector(".content");
    },
    eventListeners() {
      this.$openers.forEach((opener) => {
        console.log(opener);
        opener.addEventListener("click", (ev) => {
          console.log(ev.target);
        });
      });
    },
    async fetchWeather(city) {
      const weatherApi = new WeatherApi();
      return await weatherApi.getCurrentWeather(city);
    },
    updateWeather(weatherData) {
      console.log(weatherData);
    },
  };
  app.init();
})();
