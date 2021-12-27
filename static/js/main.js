(() => {
  // Application.
  const app = {
    // Initialize
    init() {
      // Get current url and save it in a variable.
      this.url = new URL(document.location);

      // Cache al pre needed elements.
      this.cacheElements();
      // Add event listeners to default items.
      this.eventListeners();
      // Fetch & update covid cases.
      this.fetchGhentCovidPositiveCases().then((r) =>
        this.updateGhentCovidPositiveCases(r)
      );
      // Fetch, update & get (add event listener) weather
      this.fetchWeather(this.url.searchParams.get("city"))
        .then((r) => this.updateWeather(r))
        .then(() => this.getWeather());
      // Fetch, update & get pgm users (json)
      this.fetchPGMUsersList()
        .then((r) => this.updatePGMUsersList(r))
        .then(() => this.getUsersList());
      // Fetch, update & get pgm users repos
      this.fetchUserRepositories()
        .then((r) => this.getUserRepositories(r))
        .then((r) => this.updateMainContent(r));
      // Start the search engine.
      this.searchEngine();
      // Add event listeners to GitHub.
      this.getGithub();
    },

    // Cache elements
    cacheElements() {
      // Openers and closers for mobile.
      this.$openers = document.querySelectorAll(".opener");
      this.$closers = document.querySelectorAll(".closer");

      // Covid element
      this.$covidCases = document.querySelector(".covid-cases");

      // Weather elements.
      this.$weather = document.querySelector(".weather");
      this.$weatherSearch = document.querySelector(".weather-search-form");
      this.$weatherName = document.querySelector("#weather-name");

      // Team Pgm.
      this.$teamPgm = document.querySelector(".team-pgm");

      // Search.
      this.$searchForm = document.querySelector(".search-form");
      this.$searchInput = document.querySelector("#search");
      this.$searchType = document.querySelector(".search-type");
      this.$searchResults = document.querySelector(".search-results");

      // Main content
      this.$content = document.querySelector("main > section.content");
    },

    // Event listeners
    eventListeners() {
      // Openers events
      this.$openers.forEach((opener) => {
        // Get parent from dataset.
        const dsParent = opener.dataset.parent;
        // Get other opener
        const otherOpener =
          dsParent === "pgm-team"
            ? document.querySelector(`.opener_right`)
            : document.querySelector(`.opener:not(.opener_right)`);

        // Get other closer.
        const closer =
          dsParent === "pgm-team"
            ? document.querySelector(".closer:not(.closer_right)")
            : document.querySelector(".closer_right");

        // Get parent
        const parent = document.querySelector(`#${opener.dataset.parent}`);

        // Add event listener
        opener.addEventListener("click", (ev) => {
          // If opener right set these values.
          if (ev.target.classList.contains("opener_right")) {
            otherOpener.style.left = "-20rem";
            parent.style = "right: 0";
            closer.style.right = "18.5rem";
            // Else (the left one) set other values.
          } else {
            otherOpener.style.right = "-20rem";
            parent.style = "left: 0";
            closer.style.left = "18.5rem";
          }
        });
      });

      // Closer events
      this.$closers.forEach((closer) => {
        // get saved (in dataset) parent
        const dsParent = closer.dataset.parent;
        // Get the right other opener.
        const otherOpener =
          dsParent === "pgm-team"
            ? document.querySelector(`.opener_right`)
            : document.querySelector(`.opener:not(.opener_right)`);

        // Get parent by dataset.
        const parent = document.querySelector(`#${closer.dataset.parent}`);

        // Add event listener for clicks.
        closer.addEventListener("click", () => {
          // Clear styles on click
          parent.style = closer.style = otherOpener.style = "";
        });
      });
    },

    // Fetch weather
    async fetchWeather(city) {
      // Check if city is valid, set default.
      city = city === null ? "Ghent" : city;
      // Create new instance of the weatherApi
      const weatherApi = new WeatherApi();
      // Await and return the current weather.
      return await weatherApi.getCurrentWeather(city);
    },
    // Update the weather.
    updateWeather(weatherData) {
      // Set url data.
      this.url.searchParams.set("city", weatherData.location.name);
      // Push it to current client.
      history.pushState(`city=${weatherData.location.name}`, null, this.url);
      // Update weather city
      this.$weatherName.innerHTML = `${weatherData.location.name}, ${weatherData.location.country}`;
      // Update weather temp.
      this.$weather.innerHTML = weatherData.current.temp_c;
      // Cache weather.
      this.getWeather();
    },
    getWeather() {
      // Check if element has event listener
      if (this.$weatherSearch.dataset.listener !== "true") {
        // Set element as having a event listener
        this.$weatherSearch.dataset.listener = "true";

        // Add event listener
        this.$weatherSearch.addEventListener("submit", (ev) => {
          // Prevent default behaviour of the search button.
          ev.preventDefault();
          // Start fetch for weather.
          this.fetchWeather(ev.target[0].value)
            .then((r) => this.updateWeather(r))
            .catch();
        });
      }
    },

    // Fetch covid positives.
    async fetchGhentCovidPositiveCases() {
      // Create new instance of the open gent data api.
      const ghentApi = new GhentOpenDataApi();
      // await and return the covid positives cases.
      return await ghentApi.getCovidPositiveCases();
    },
    // Update html for covid positieve cases.
    updateGhentCovidPositiveCases(covidCases) {
      // Set inner html.
      this.$covidCases.innerHTML = covidCases.records[0].fields.cases;
    },

    // Fetch users
    async fetchPGMUsersList() {
      // Create new instance of the users api.
      const usersApi = new UsersApi();
      // Await and return the users.
      return await usersApi.getUsers();
    },
    // Update the users list and html.
    updatePGMUsersList(users) {
      // Set inner html.
      this.$teamPgm.innerHTML = users
        .map(
          (user) => `
          <li data-user="${user.portfolio.githubUsername}">
              <img class="round-img" src="static/media/images/thumbnail/${user.thumbnail}" alt="Error, no data loaded!">
              <div>
                  <p class="text_bold">${user.firstName} ${user.lastName}</p>
                  <p>${user.portfolio.githubUsername}</p>
              </div>
          </li>`
        )
        .join("");
    },

    // Adds event listener to the users.
    getUsersList(query = ".team-pgm > li", youtube = false) {
      // Get all new users.
      const $users = document.querySelectorAll(query);
      // check if the users are YouTube or not.
      youtube
        ? $users.forEach((user) => {
          user.addEventListener("click", (ev) => {
            // YouTube users
            this.fetchYoutubeVideo(ev.target.dataset.video)
              .then((r) => this.generateYoutubeInfo(r))
              .then((r) => this.updateMainContent(r));
          });
        })
        : $users.forEach((user) => {
          user.addEventListener("click", (ev) => {
            // GitHub user's.
            this.generateUserInfo(ev.target.dataset.user)
              .then((r) => this.updateMainContent(r))
              .then(() => this.getUsersList(".follows > li"));
          });
        });
    },
    // Generate user info in 3 steps.
    async generateUserInfo(user) {
      // Generate header.
      const header = await this.fetchUser(user).then((r) =>
        this.getUserHeader(r)
      );

      // Generate repos.
      const repos = await this.fetchUserRepositories(user).then((r) =>
        this.getUserRepositories(r)
      );

      // Generate followers.
      const followers = await this.fetchUserFollows(user).then((r) =>
        this.getUserFollows(r)
      );

      // Return just created variables.
      return header + repos + followers;
    },

    // Search engine, gets url and runs right search.
    searchEngine() {
      // Get searchType
      const searchType = this.url.searchParams.get("searchType");

      // Check type
      if (searchType === "YouTube") {
        // if YouTube start YouTube search.
        this.getSearchEngine(false);
      } else {
        // if GitHub start GitHub search.
        this.getSearchEngine(true);
      }
    },
    // Search engine and builder
    getSearchEngine(type = true) {
      // Check what type is currently active.
      type
        ? (this.$searchType.innerHTML = `
          <h3>GitHub Users</h3>
          <div id="search-youtube" class="search_youtube-github arrow-right red-bg">
            <span></span>
            <span></span>
          </div>`)
        : (this.$searchType.innerHTML = `
          <div id="search-github" class="search_youtube-github arrow-left blue-bg">
            <span></span>
            <span></span>
          </div>
          <h3 class="red-bg">Youtube Search</h3>`);

      // Set type as url.
      type
        ? this.url.searchParams.set("searchType", "Github")
        : this.url.searchParams.set("searchType", "YouTube");
      // Push that to the client.
      history.pushState("searchType: Type", null, this.url);

      // Check the correct type
      type ? this.searchEngineCheck(true) : this.searchEngineCheck(false);

      // Cache search element
      const search = document.querySelector(".search_youtube-github");
      // Check if it hasn't a listener
      if (search.dataset.listener !== "true") {
        // Set element as having a event listener
        search.dataset.listener = "true";
        // Add the listener
        search.addEventListener("click", () => this.getSearchEngine(!type));
      }
    },
    // Check if search is valid, then search.
    searchEngineCheck(type) {
      // get current search,
      const search = this.url.searchParams.get("search");
      // check if search is valid, and end function if not so.
      if (search === "" || search === null) return false;

      // Fill the search in with the value.
      this.$searchInput.value = search;

      // Check what type of search and run the correct fetch, update & events.
      type
        ? this.fetchGithubUsers(search)
          .then((r) => this.updateGithubUsers(r))
          .then(() => this.getUsersList(".search-results li"))
          .catch()
        : this.fetchYoutubeSearch(search)
          .then((r) => this.updateYoutubeSearch(r))
          .then(() => this.getUsersList(".search-results li", true))
          .catch();
    },

    // YouTube search
    async fetchYoutubeSearch(search) {
      // Create new instance of YouTube API object.
      const youtubeApi = new YoutubeApi();
      // Await and return the YouTube search.
      return await youtubeApi.search(search);
    },
    // Update the YouTube search list
    updateYoutubeSearch(results) {
      // If the results are none, set innerHTML empty and stop.
      if (!results) {
        this.$searchResults.innerHTML = "";
        return;
      }
      // If not, map the results
      this.$searchResults.innerHTML = results.items
        .map((result) => {
          return `
          <li class="flex align-center" data-video="${result.id.videoId}">
              <img class="img-yt" src="${result.snippet.thumbnails.default.url}" alt="Error, no data loaded!">
              <div class="flex align-center">
                  <p class="text_bold"><a target="_blank" href="https://youtu.be/${result.id.videoId}">${result.snippet.title}</a></p>
              </div>
          </li>`;
        })
        // Join the results (out of the array)
        .join("");
    },

    // Fetch youtube videos
    async fetchYoutubeVideo(videoId) {
      // Create new instance of the YouTube api.
      const youtubeApi = new YoutubeApi();
      // Await and return the YouTube video.
      return await youtubeApi.getVideo(videoId);
    },
    // Get html content for youtube videos.
    generateYoutubeInfo({items: [data]}) {
      // return the html needed for the video.
      return `
        <section>
          <iframe class="yt-player" loading="lazy" src="https://www.youtube.com/embed/${data.id}"></iframe>
        </section>`;
    },

    // Fetch GitHub users.
    async fetchGithubUsers(search) {
      // Create new instance of the githubApi.
      const githubApi = new GitHubApi();
      // Await and return the GitHub search results.
      return await githubApi.getSearchUsers(search);
    },
    // Update content for the GitHub users.
    updateGithubUsers(users) {
      // If the user does not exist of the data does not exist, return empty string.
      if (!users) {
        this.$searchResults.innerHTML = "";
        return;
      }
      // Else map through the users.
      this.$searchResults.innerHTML = users.items
        .map((user) => {
          return `
          <li data-user="${user.login}">
              <img class="round-img" src="${user.avatar_url}" alt="Error, no data loaded!">
              <div class="flex align-center">
                  <p class="text_bold">${user.login}</p>
              </div>
          </li>`;
        })
        .join("");
    },
    // Add event listeners for the github search
    getGithub() {
      //add events
      this.$searchForm.addEventListener("submit", (ev) => {
        // prevent the default behaviour.
        ev.preventDefault();

        // Check if value is legit.
        if (ev.target[0].value === "" || ev.target[0].value === null) {
          this.updateGithubUsers();
          return false;
        }

        // Set url for search
        this.url.searchParams.set("search", `${ev.target[0].value}`);
        // Push it to the client.
        history.pushState(`search=${ev.target[0].value}`, null, this.url);

        // Return to searchEngine
        this.searchEngine();
      });
    },
    async fetchUserRepositories(username = "pgmgent") {
      // Create new instance of Github api
      const githubApi = new GitHubApi();
      // await and return the repos of the users.
      return await githubApi.getReposOfUsers(username);
    },
    getUserRepositories(data) {
      const repos =
        // Check if data is valid.
        data.length > 0
          // if valid map through the repositories.
          ? data
            .map((repo) => {
              const license = repo.license
                ? `<span class="license">${repo.license.name}</span>`
                : "";
              const description = repo.description
                ? `<p>${repo.description}</p>`
                : "";
              return `
          <article>
              <h4><a target="_blank" href="${repo.html_url}">${
                repo.full_name
              }</a></h4>
              ${description}
              <div class="tags">
                  <span class="size">${
                repo.size <= 999
                  ? repo.size + "KB"
                  : (repo.size / 1000).toFixed(2) + "MB"
              }</span>
                  <span class="branche">${repo.default_branch}</span>${license}
                  <span class="visibility">${repo.visibility}</span>
                  <span class="issues">${repo.open_issues}</span>
                  <span class="watch">${repo.watchers_count}</span>
                  <span class="stars">${repo.stargazers_count}</span>
              </div>
          </article>`;
            })
            .join("")
          // Else return error message.
          : "<article><h4>No repositories found...</h4></article>";

      // Return valid html with right content.
      return `
      <h2>Repositories</h2>
      <section class="repos">
          ${repos}
      </section>`;
    },
    // Fetch the followers of the users.
    async fetchUserFollows(username = "pgmgent") {
      // Create new instance of Github api.
      const githubApi = new GitHubApi();
      // Await and return the GitHub followers results.
      return await githubApi.getFollowersOfUsers(username);
    },
    getUserFollows(data) {
      // check if followers is valid.
      const followers =
        data.length > 0
          // Loop through the followers.
          ? data
            .map(
              (follower) => `
                <li data-user="${follower.login}">
                    <p>${follower.login}</p>
                    <img src="${follower.avatar_url}" alt="${follower.login}">
                </li>`
            )
            .join("")
          // Else give error.
          : "<article><h4>No followers found...</h4></article>";

      // Return valid html.
      return `
        <h2>Followers</h2>
        <ul class="${data.length > 0 ? "follows" : ""}">
            ${followers}
        </ul>`;
    },

    async fetchUser(username) {
      // Create new instance of the GitHubApi.
      const githubApi = new GitHubApi();
      // await and return the users.
      return await githubApi.getSearchUsers(username);
    },
    async getUserHeader({items: [user]}) {
      // Create new instance of the users api.
      const usersApi = new UsersApi();
      // get the users.
      const pgmUsers = await usersApi.getUsers();
      // Filter and destructure the first user.
      const [pgmUser] = pgmUsers.filter(
        (databaseUser) => databaseUser.portfolio.githubUsername === user.login
      );

      // Create new date object if the user exists else return string.
      const date = pgmUser ? new Date(pgmUser.birthday) : "";
      // Check user type.
      const isPgmUser = pgmUser
        // If pgmUser, return more data.
        ? `<p class="profile-lecturer">${
          pgmUser.lecturer ? "Lecturer" : "Student"
        }</p>
           <p class="profile-bday">${date.getDate()}/${
          date.getMonth() + 1
        }/${date.getFullYear()}</p>
           <p class="profile-quote">${pgmUser.quote}</p>`
        // Else normal data.
        : "";
      return user
        ? `<section class='profile-details' style='background-image: url(${user.avatar_url})'>
              ${isPgmUser}
              <p class='profile-name'>${user.login}</p>
           </section>`
        : "<article><h4>Oops! Not found...</h4></article>";
    },
    updateMainContent(data) {
      // Set main content.
      this.$content.innerHTML = data;
    },
  };
  app.init();
})();
