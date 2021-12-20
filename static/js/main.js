(() => {
  const app = {
    init() {
      this.url = new URL(document.location);

      this.cacheElements();
      this.eventListeners();
      this.fetchWeather(this.url.searchParams.get("city")).then((r) =>
        this.updateWeather(r)
      );
      this.fetchGhentCovidPositiveCases().then((r) =>
        this.updateGhentCovidPositiveCases(r)
      );
      this.fetchPGMUsersList()
        .then((r) => this.updatePGMUsersList(r))
        .then((r) => this.getPGMUsersList(r));
      this.searchEngine();
      this.fetchUserRepositories()
        .then((r) => this.getUserRepositories(r))
        .then((r) => this.updateMainContent(r));
    },

    cacheElements() {
      this.$openers = document.querySelectorAll(".opener");
      this.$closers = document.querySelectorAll(".closer");

      this.$teamPgm = document.querySelector(".team-pgm");

      this.$usersGithub = document.querySelector(".users-github");
      this.$searchForm = document.querySelector(".search-form");
      this.$searchInput = document.querySelector("#search");
      this.$searchType = document.querySelector(".search-type");

      this.$covidCases = document.querySelector(".covid-cases");

      this.$weather = document.querySelector(".weather");
      this.$weatherSearch = document.querySelector(".weather-search-form");
      this.$weatherName = document.querySelector("#weather-name");

      this.$content = document.querySelector("main > section.content");
    },

    eventListeners() {
      // Openers events
      this.$openers.forEach((opener) => {
        const dsParent = opener.dataset.parent;
        const otherOpener =
          dsParent === "pgm-team"
            ? document.querySelector(`.opener_right`)
            : document.querySelector(`.opener:not(.opener_right)`);

        const closer =
          dsParent === "pgm-team"
            ? document.querySelector(".closer:not(.closer_right)")
            : document.querySelector(".closer_right");

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
        const otherOpener =
          dsParent === "pgm-team"
            ? document.querySelector(`.opener_right`)
            : document.querySelector(`.opener:not(.opener_right)`);

        const parent = document.querySelector(`#${closer.dataset.parent}`);

        closer.addEventListener("click", () => {
          otherOpener.style.left = parent.style = closer.style.left = "";
        });
      });

      // Github search function
      this.$searchForm.addEventListener("submit", (ev) => {
        // For browser compatibility will change the submit query myself.
        ev.preventDefault();
        if (ev.target[0].value === "" || ev.target[0].value === null) {
          this.updateGithubUsers();
          return false;
        }
        this.url.searchParams.set("search", `${ev.target[0].value}`);
        history.pushState(`search=${ev.target[0].value}`, null, this.url);
        this.searchEngine();
        // this.fetchGithubUsers(this.url.searchParams.get("search")).then((r) =>
        //   this.updateGithubUsers(r)
      });

      this.$weatherSearch.addEventListener("submit", (ev) => {
        // For browser compatibility will change the submit query myself.
        ev.preventDefault();
        this.fetchWeather(ev.target[0].value).then((r) => {
          this.updateWeather(r);
        });
      });
    },

    async fetchWeather(city) {
      city = city === null ? "Ghent" : city;
      const weatherApi = new WeatherApi();
      return await weatherApi.getCurrentWeather(city);
    },
    updateWeather(weatherData) {
      this.url.searchParams.set("city", weatherData.location.name);
      history.pushState(`city=${weatherData.location.name}`, null, this.url);
      this.$weatherName.innerHTML = `${weatherData.location.name}, ${weatherData.location.country}`;
      this.$weather.innerHTML = weatherData.current.temp_c;
    },

    async fetchGhentCovidPositiveCases() {
      const ghentApi = new GhentOpenDataApi();
      return await ghentApi.getCovidPositiveCases();
    },
    updateGhentCovidPositiveCases(covidCases) {
      this.$covidCases.innerHTML = covidCases.records[0].fields.cases;
    },

    async fetchPGMUsersList() {
      const response = await fetch("static/data/pgm.json");
      return response.json();
    },
    updatePGMUsersList(users) {
      this.$teamPgm.innerHTML = users
        .map((user) => {
          return `
            <li>
                <img class="round-img" src="static/media/images/thumbnail/${user.thumbnail}" alt="Error, no data loaded!">
                <div>
                    <p class="text_bold">${user.firstName} ${user.lastName}</p>
                    <p>${user.portfolio.githubUsername}</p>
                </div>
            </li>`;
        })
        .join("");
    },
    getPGMUsersList() {
      this.$teamPgmAll = document.querySelectorAll(".team-pgm > li");
      this.$teamPgmAll.forEach((teamMember) => {
        teamMember.addEventListener("click", (ev) => {
          console.log(ev);
        });
      });
    },

    searchEngine() {
      const searchType = this.url.searchParams.get("searchType");

      if (searchType === "YouTube") {
        this.getSearchEngine(false);
        this.searchEngineCheck(false);
      } else {
        this.getSearchEngine(true);
        this.searchEngineCheck(true);
      }
    },
    getSearchEngine(type = true) {
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
      type
        ? this.url.searchParams.set("searchType", "Github")
        : this.url.searchParams.set("searchType", "YouTube");
      history.pushState("searchType: Type", null, this.url);
      const search = document.querySelector(".search_youtube-github");
      search.addEventListener("click", () => this.getSearchEngine(!type));
      type ? this.searchEngineCheck(true) : this.searchEngineCheck(false);
    },
    searchEngineCheck(type) {
      const search = this.url.searchParams.get("search");
      if (search === "" || search === null) return false;
      this.$searchInput.value = search;

      type
        ? this.fetchGithubUsers(search).then((r) => this.updateGithubUsers(r))
        : this.fetchYoutubeSearch(search).then((r) =>
            this.updateYoutubeSearch(r)
          );
    },

    async fetchYoutubeSearch(search) {
      const youtubeApi = new YoutubeApi();
      return await youtubeApi.search(search);
    },
    updateYoutubeSearch(results) {
      if (!results) {
        this.$usersGithub.innerHTML = "";
        return;
      }
      this.$usersGithub.innerHTML = results.items
        .map((result) => {
          return `
          <li class="flex align-center">
              <img class="img-yt" src="${result.snippet.thumbnails.default.url}" alt="Error, no data loaded!">
              <div class="flex align-center">
                  <p class="text_bold"><a target="_blank" href="https://youtu.be/${result.id.videoId}">${result.snippet.title}</a></p>
              </div>
          </li>`;
        })
        .join("");
    },

    async fetchGithubUsers(search) {
      const githubApi = new GitHubApi();
      return await githubApi.getSearchUsers(search);
    },
    updateGithubUsers(users) {
      if (!users) {
        this.$usersGithub.innerHTML = "";
        return;
      }
      this.$usersGithub.innerHTML = users.items
        .map((user) => {
          return `
          <li>
              <img class="round-img" src="${user.avatar_url}" alt="Error, no data loaded!">
              <div class="flex align-center">
                  <p class="text_bold">${user.login}</p>
              </div>
          </li>`;
        })
        .join("");
    },
    async fetchUserRepositories(username = "pgmgent") {
      const githubApi = new GitHubApi();
      return await githubApi.getReposOfUsers(username);
    },
    getUserRepositories(data) {
      const repos = data
        .map((repo) => {
          const license = repo.license
            ? `<span class="license">${repo.license.name}</span>`
            : "";
          const description = repo.description
            ? `<p>${repo.description}</p>`
            : "";
          return `
          <article>
              <h4><a target="_blank" href="${repo.html_url}">${repo.full_name}</a></h4>
              ${description}
              <div class="tags">
                  <span class="size">${repo.size}KB</span>
                  <span class="branche">${repo.default_branch}</span>${license}
                  <span class="visibility">${repo.visibility}</span>
                  <span class="issues">${repo.open_issues}</span>
                  <span class="watch">${repo.watchers_count}</span>
                  <span class="stars">${repo.stargazers_count}</span>
              </div>
          </article>`;
        })
        .join("");
      return `
        <h2>Repositories</h2>
        <section class="repos">
            ${repos}
        </section>
        <h2>Folowers</h2>
        <section class="repos">
            <article>
                <h4>No Followers...</h4>
            </article>
        </section>`;
    },

    updateMainContent(data) {
      this.$content.innerHTML = data;
    },
  };
  app.init();
})();
