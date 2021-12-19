(() => {
  const app = {
    init() {
      this.url = new URL(document.location);
      this.cacheElements();
      this.eventListeners();
      this.fetchWeather().then((r) => this.updateWeather(r));
      this.fetchGhentCovidPositiveCases().then((r) =>
        this.updateGhentCovidPositiveCases(r)
      );
      this.fetchPGMUsersList().then((r) => this.updatePGMUsersList(r));
      this.fetchGithubUsers(this.url.searchParams.get("search")).then((r) =>
        this.updateGithubUsers(r)
      );
    },
    cacheElements() {
      this.$openers = document.querySelectorAll(".opener");
      this.$closers = document.querySelectorAll(".closer");
      // this.$asides = document.querySelectorAll("main > aside");
      this.$teamPgm = document.querySelector(".team-pgm");
      this.$usersGithub = document.querySelector(".users-github");
      this.$githubSearch = document.querySelector(".github-search");
      this.$githubSearchForm = document.querySelector(".github-search-form");
      this.$githubSearchInput = document.querySelector("#github-search");
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

      // Github search
      this.$githubSearch.addEventListener("click", (ev) => {});

      this.$githubSearchForm.addEventListener("submit", (ev) => {
        // For browser compatibility will change the submit query myself.
        ev.preventDefault();
        window.location.search = ev.target[0].value
          ? `search=${ev.target[0].value}`
          : "";
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
    async fetchGithubUsers(search) {
      if (search === "" || search === null) return [];
      this.$githubSearchInput.value = search;
      const githubApi = new GitHubApi();
      return await githubApi.getSearchUsers(search);
    },
    updateGithubUsers(users) {
      console.log(users);
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
  };
  app.init();
})();
