(() => {
  const app = {
    init() {
      this.fetchWeather().then(r => this.updateWeather(r));
    },
    async fetchWeather(city) {
      const weatherApi = new WeatherApi();
      return await weatherApi.getCurrentWeather(city);
    },
    updateWeather(weatherData) {
      console.log(weatherData);
    }
  };
  app.init();
})();