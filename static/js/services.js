// Github Constructor
function GitHubApi() {
  // search users
  this.getSearchUsers = async (name) => {
    // Fetch data
    const result = await fetch(
      `https://api.github.com/search/users?sort=desc&page=1&per_page=100&q=${name}`
    );
    // Return json format
    return result.json();
  };
  // get repos
  this.getReposOfUsers = async (username) => {
    // fetch data
    const result = await fetch(
      `https://api.github.com/users/${username}/repos?page=1&per_page=50`
    );
    // return json format
    return result.json();
  };
  // get followers
  this.getFollowersOfUsers = async (username) => {
    // fetch
    const result = await fetch(
      `https://api.github.com/users/${username}/followers?page=1&per_page=100`
    );
    // return json
    return result.json();
  };
}

// Youtube constructor
function YoutubeApi() {
  // Youtube api key... normally in a .ENV file...
  this.key = "AIzaSyCnO4mqP338pGXky4t7hJYXeM1L4PrlNvE";
  // search function.
  this.search = async (search) => {
    // fetch
    const result = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${this.key}&part=snippet&maxResults=20&q=${search}`
    );
    // return json
    return result.json();
  };
  // video finder
  this.getVideo = async (videoId) => {
    // fetch
    const result = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${this.key}`
    );
    // return json
    return result.json();
  };
}

// Users constructor
function UsersApi() {
  // Get function
  this.getUsers = async () => {
    // fetch
    const response = await fetch("static/data/pgm.json");
    // return json
    return response.json();
  };
}

// Weather constructor
function WeatherApi() {
  // get current weather
  this.getCurrentWeather = async (city = "Ghent") => {
    // key, normaly in .ENV
    const key = "de293147099b4f26a26184812211512";
    // Fetch
    const result = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${key}&q=${city}`
    );
    // Return json
    return result.json();
  };
}

// Ghent data constructor
function GhentOpenDataApi() {
  // get covid cases function.
  this.getCovidPositiveCases = async () => {
    // fetch
    const result = await fetch(
      `https://data.stad.gent/api/records/1.0/search/?dataset=dataset-of-cumulative-number-of-confirmed-cases-by-municipality`
    );
    // return json.
    return result.json();
  };
}
