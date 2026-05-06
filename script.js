// global variables
var API_KEY = "2382f9afcdf99bcbce8930e250c5f1d7";
var IMG_URL = "https://image.tmdb.org/t/p/";
var featuredList = [];
var currentSlide = 0;
var slideTimer = null;

// demo movies (fallback if API fails)
var demoMovies = [
  { id: 1, title: "Inception", release_date: "2010-07-16", vote_average: 8.8, overview: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.", poster_path: null, backdrop_path: null, genre_ids: [28, 878, 53] },
  { id: 2, title: "Interstellar", release_date: "2014-11-05", vote_average: 8.6, overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", poster_path: null, backdrop_path: null, genre_ids: [878, 18, 12] },
  { id: 3, title: "The Dark Knight", release_date: "2008-07-18", vote_average: 9.0, overview: "When the Joker wreaks havoc on Gotham, Batman must accept one of the greatest tests of his ability to fight injustice.", poster_path: null, backdrop_path: null, genre_ids: [28, 80, 18] },
  { id: 4, title: "Parasite", release_date: "2019-10-05", vote_average: 8.5, overview: "Greed and class discrimination threaten the newly formed relationship between the wealthy Park family and the destitute Kim clan.", poster_path: null, backdrop_path: null, genre_ids: [35, 53, 18] },
  { id: 5, title: "Dune", release_date: "2021-10-22", vote_average: 7.9, overview: "A noble family's son is entrusted with the protection of the most valuable asset in the galaxy.", poster_path: null, backdrop_path: null, genre_ids: [878, 12] },
  { id: 6, title: "The Godfather", release_date: "1972-03-14", vote_average: 9.2, overview: "The aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son.", poster_path: null, backdrop_path: null, genre_ids: [80, 18] },
  { id: 7, title: "Oppenheimer", release_date: "2023-07-21", vote_average: 8.3, overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.", poster_path: null, backdrop_path: null, genre_ids: [18, 36] },
  { id: 8, title: "Barbie", release_date: "2023-07-21", vote_average: 7.1, overview: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.", poster_path: null, backdrop_path: null, genre_ids: [35, 12] }
];

// genre id to name mapping
var genreNames = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 14: "Fantasy",
  27: "Horror", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  53: "Thriller", 37: "Western", 36: "History", 10751: "Family"
};


// ---- HELPER FUNCTIONS ----

function getPosterUrl(path) {
  if (path) { return IMG_URL + "w342" + path; }
  return null;
}

function getBackdropUrl(path) {
  if (path) { return IMG_URL + "w1280" + path; }
  return null;
}

function getYear(dateStr) {
  if (dateStr) { return dateStr.slice(0, 4); }
  return "N/A";
}

function getRating(val) {
  if (val) { return val.toFixed(1); }
  return "-";
}

function showToast(msg) {
  var toast = document.getElementById("toast-msg");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(function() { toast.classList.remove("show"); }, 3000);
}


// ---- CAROUSEL SCROLL ----

function slideLeft(carouselId) {
  document.getElementById(carouselId).scrollLeft -= 440;
}

function slideRight(carouselId) {
  document.getElementById(carouselId).scrollLeft += 440;
}


// ---- MAKE A MOVIE CARD ----

function makeCard(movie, rank) {
  var card = document.createElement("div");
  card.className = "movie-card";
  card.onclick = function() { openModal(movie.id); };

  var poster = getPosterUrl(movie.poster_path);
  var imgHTML = poster
    ? '<img src="' + poster + '" alt="' + movie.title + '" loading="lazy" />'
    : '<div class="no-poster">🎬</div>';

  var badgeHTML = rank ? '<div class="rank-badge">' + rank + '</div>' : "";

  card.innerHTML = badgeHTML + imgHTML +
    '<div class="card-info">' +
      '<div class="card-title">' + movie.title + '</div>' +
      '<div class="card-bottom">' +
        '<span class="card-year">' + getYear(movie.release_date) + '</span>' +
        '<span class="card-star">' + getRating(movie.vote_average) + '</span>' +
      '</div>' +
    '</div>';

  return card;
}


// ---- FILL A CAROUSEL WITH CARDS ----

function fillCarousel(carouselId, movies, showRank) {
  var carousel = document.getElementById(carouselId);
  carousel.innerHTML = "";
  for (var i = 0; i < movies.length; i++) {
    var rank = (showRank && i < 3) ? "#" + (i + 1) : null;
    carousel.appendChild(makeCard(movies[i], rank));
  }
}


// ---- BUILD FEATURED SLIDER ----

function buildFeatured() {
  if (featuredList.length === 0) return;
  clearInterval(slideTimer);

  var slidesContainer = document.getElementById("featured-slides");
  var dotsContainer = document.getElementById("slide-dots");
  slidesContainer.innerHTML = "";
  dotsContainer.innerHTML = "";

  var count = Math.min(featuredList.length, 5);

  for (var i = 0; i < count; i++) {
    var movie = featuredList[i];
    var bg = getBackdropUrl(movie.backdrop_path);

    var slide = document.createElement("div");
    slide.className = "featured-slide" + (i === 0 ? " active" : "");

    var imgPart = bg
      ? '<img src="' + bg + '" alt="' + movie.title + '" />'
      : '<div class="no-img">🎬</div>';

    var movieId = movie.id;
    slide.innerHTML = imgPart +
      '<div class="featured-overlay">' +
        '<div class="featured-text">' +
          '<span class="featured-badge">Trending</span>' +
          '<div class="featured-title">' + movie.title + '</div>' +
          '<div class="featured-desc">' + movie.overview + '</div>' +
          '<div class="featured-buttons">' +
            '<button class="btn-yellow" onclick="openModal(' + movieId + ')">View Details</button>' +
            '<button class="btn-outline">★ ' + getRating(movie.vote_average) + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    slidesContainer.appendChild(slide);

    var dot = document.createElement("button");
    if (i === 0) dot.className = "active";
    (function(index) {
      dot.onclick = function() { goToSlide(index); };
    })(i);
    dotsContainer.appendChild(dot);
  }

  currentSlide = 0;
  slideTimer = setInterval(function() {
    var slides = document.querySelectorAll(".featured-slide");
    goToSlide((currentSlide + 1) % slides.length);
  }, 5000);
}

function goToSlide(index) {
  var slides = document.querySelectorAll(".featured-slide");
  var dots = document.querySelectorAll(".slide-dots button");
  for (var i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active");
    dots[i].classList.remove("active");
  }
  slides[index].classList.add("active");
  dots[index].classList.add("active");
  currentSlide = index;
}


// ---- FETCH FROM TMDB ----

async function fetchTMDB(path) {
  var url = "https://api.themoviedb.org/3" + path + "?api_key=" + API_KEY + "&language=en-US";
  var response = await fetch(url);
  if (!response.ok) { throw new Error("API error: " + response.status); }
  return await response.json();
}


// ---- LOAD ALL SECTIONS FROM LIVE API ----

async function loadAllSections() {
  try {
    var trending   = await fetchTMDB("/trending/movie/week");
    var nowPlaying = await fetchTMDB("/movie/now_playing");
    var topRated   = await fetchTMDB("/movie/top_rated");

    featuredList = trending.results.filter(function(m) {
      return m.backdrop_path;
    }).slice(0, 8);

    buildFeatured();

    fillCarousel("carousel-trending",   trending.results.slice(0, 12),   true);
    fillCarousel("carousel-nowplaying", nowPlaying.results.slice(0, 12), false);
    fillCarousel("carousel-toprated",   topRated.results.slice(0, 12),   true);

    showToast("Movies loaded successfully!");

  } catch (err) {
    showToast("Failed to load movies: " + err.message);
    loadDemo(); // fallback to demo data
  }
}


// ---- SEARCH ----

function doSearch() {
  var query = document.getElementById("search-input").value.trim();
  if (!query) return;
  runSearch(query);
}

function quickSearch(query) {
  document.getElementById("search-input").value = query;
  runSearch(query);
}

async function runSearch(query) {
  var section = document.getElementById("search-section");
  var grid = document.getElementById("search-grid");

  section.style.display = "block";
  grid.innerHTML = "<p style='color:#9996a8'>Searching...</p>";
  document.getElementById("search-heading").innerHTML = "Search <span>Results</span>";
  section.scrollIntoView({ behavior: "smooth" });

  try {
    var url = "https://api.themoviedb.org/3/search/movie?api_key=" + API_KEY + "&query=" + encodeURIComponent(query) + "&language=en-US";
    var response = await fetch(url);
    var data = await response.json();

    grid.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      grid.innerHTML = "<p style='color:#9996a8'>No results found.</p>";
      return;
    }

    for (var j = 0; j < data.results.length; j++) {
      grid.appendChild(makeCard(data.results[j], null));
    }

  } catch (err) {
    grid.innerHTML = "<p style='color:#ff4757'>Error: " + err.message + "</p>";
  }
}

function closeSearch() {
  document.getElementById("search-section").style.display = "none";
  document.getElementById("search-grid").innerHTML = "";
}


// ---- GENRE SEARCH ----

async function genreSearch(genreId, genreName) {
  var section = document.getElementById("search-section");
  var grid = document.getElementById("search-grid");

  section.style.display = "block";
  document.getElementById("search-heading").innerHTML = "Genre: <span>" + genreName + "</span>";
  grid.innerHTML = "<p style='color:#9996a8'>Loading...</p>";
  section.scrollIntoView({ behavior: "smooth" });

  try {
    var url = "https://api.themoviedb.org/3/discover/movie?api_key=" + API_KEY + "&with_genres=" + genreId + "&sort_by=popularity.desc&language=en-US";
    var response = await fetch(url);
    var data = await response.json();

    grid.innerHTML = "";

    for (var j = 0; j < data.results.length; j++) {
      grid.appendChild(makeCard(data.results[j], null));
    }

  } catch (err) {
    grid.innerHTML = "<p style='color:#ff4757'>Error: " + err.message + "</p>";
  }
}


// ---- MODAL ----

async function openModal(movieId) {
  document.getElementById("modal-overlay").classList.add("open");
  document.getElementById("modal-content").innerHTML = "<div style='padding:40px; text-align:center; color:#9996a8;'>Loading...</div>";

  try {
    var url = "https://api.themoviedb.org/3/movie/" + movieId + "?api_key=" + API_KEY + "&language=en-US";
    var response = await fetch(url);
    var movie = await response.json();
    showModal(movie);
  } catch (err) {
    document.getElementById("modal-content").innerHTML = "<div style='padding:40px; color:#ff4757'>Error loading movie details.</div>";
  }
}

function showModal(movie) {
  var backdrop = getBackdropUrl(movie.backdrop_path);

  var genreTags = "";
  if (movie.genres) {
    for (var i = 0; i < Math.min(movie.genres.length, 4); i++) {
      genreTags += '<span class="genre-tag">' + movie.genres[i].name + '</span>';
    }
  } else if (movie.genre_ids) {
    for (var j = 0; j < Math.min(movie.genre_ids.length, 4); j++) {
      var name = genreNames[movie.genre_ids[j]];
      if (name) { genreTags += '<span class="genre-tag">' + name + '</span>'; }
    }
  }

  var backdropHTML = backdrop
    ? '<img class="modal-backdrop-img" src="' + backdrop + '" alt="' + movie.title + '" />'
    : '<div class="modal-backdrop-placeholder">🎬</div>';

  var runtimeHTML = "";
  if (movie.runtime) {
    var hrs = Math.floor(movie.runtime / 60);
    var mins = movie.runtime % 60;
    runtimeHTML = '<span>⏱ ' + hrs + 'h ' + mins + 'm</span>';
  }

  var votesHTML = movie.vote_count
    ? '<span style="font-size:13px;">(' + movie.vote_count.toLocaleString() + ' votes)</span>'
    : "";

  var popularity = movie.popularity ? Math.round(movie.popularity) : "-";

  document.getElementById("modal-content").innerHTML =
    backdropHTML +
    '<div class="modal-body">' +
      '<div class="modal-genre-tags">' + genreTags + '</div>' +
      '<div class="modal-title">' + movie.title + '</div>' +
      '<div class="modal-meta-row">' +
        '<span>📅 ' + getYear(movie.release_date) + '</span>' +
        runtimeHTML +
        '<span>⭐ <strong>' + getRating(movie.vote_average) + '</strong>/10</span>' +
        votesHTML +
      '</div>' +
      '<p class="modal-overview">' + (movie.overview || "No overview available.") + '</p>' +
      '<div class="stats-row">' +
        '<div class="stat-box"><div class="stat-label">Rating</div><div class="stat-number">' + getRating(movie.vote_average) + '</div></div>' +
        '<div class="stat-box"><div class="stat-label">Release</div><div class="stat-number">' + getYear(movie.release_date) + '</div></div>' +
        '<div class="stat-box"><div class="stat-label">Popularity</div><div class="stat-number">' + popularity + '</div></div>' +
      '</div>' +
    '</div>';
}

function closeModalClick(event) {
  if (event.target === document.getElementById("modal-overlay")) { closeModal(); }
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}


// ---- KEYBOARD SHORTCUTS ----

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") { closeModal(); }
});

document.getElementById("search-input").addEventListener("keydown", function(e) {
  if (e.key === "Enter") { doSearch(); }
});


// ---- FALLBACK DEMO LOADER ----

function loadDemo() {
  featuredList = demoMovies;
  buildFeatured();
  fillCarousel("carousel-trending", demoMovies, true);
  var reversed = demoMovies.slice().reverse();
  fillCarousel("carousel-nowplaying", reversed, false);
  var sorted = demoMovies.slice().sort(function(a, b) { return b.vote_average - a.vote_average; });
  fillCarousel("carousel-toprated", sorted, true);
}


// ---- INIT: fetch live data on page load ----
loadAllSections();
