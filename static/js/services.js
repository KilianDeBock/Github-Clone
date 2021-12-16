function GitHubApi() {
  this.getSearchUsers = async () => {
  };
  this.getReposOfUsers = async () => {
  };
  this.getFollowersOfUsers = async () => {
  };
  this.getSubscribersOfUsers = async () => {
  };
}

function UsersApi() {
  this.getUsers = async () => {
  };
}

function WeatherApi() {
  this.getCurrentWeather = async (city = 'Ghent') => {
    const key = 'de293147099b4f26a26184812211512';
    const result = await fetch(`https://api.weatherapi.com/v1/current.json?key=${key}&q=${city}`);
    return result.json();
  };
}

function GhentOpenDataApi() {
  this.getCovidPositiveCases = async () => {
  };
}