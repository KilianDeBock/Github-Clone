function GitHubApi() {
  this.getSearchUsers = async (name) => {
    const result = await fetch(
      `https://api.github.com/search/users?sort=desc&page=1&per_page=100&q=${name}`
    );
    return result.json();
  };
  this.getReposOfUsers = async (username) => {
    const result = await fetch(
      `https://api.github.com/users/${username}/repos?page=1&per_page=50`
    );
    return result.json();
  };
  this.getFollowersOfUsers = async () => {};
  this.getSubscribersOfUsers = async () => {};
}

function UsersApi() {
  this.getUsers = async () => {};
}

function WeatherApi() {
  this.getCurrentWeather = async (city = "Ghent") => {
    const key = "de293147099b4f26a26184812211512";
    const result = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${key}&q=${city}`
    );
    return result.json();
  };
}

function GhentOpenDataApi() {
  this.getCovidPositiveCases = async () => {
    const result = await fetch(
      `https://data.stad.gent/api/records/1.0/search/?dataset=dataset-of-cumulative-number-of-confirmed-cases-by-municipality`
    );
    return result.json();
  };
}
