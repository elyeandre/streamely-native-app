// Get references to the forms and labels
const movieContainer = document.querySelector('.movie-container');
const tvContainer = document.querySelector('.tv-container');
const tabRadios = document.querySelectorAll('.tab-wrapper input');
const seasonNo = document.getElementById('tvSeasonNo');
const episodeNo = document.getElementById('tvEpisodeNo');
const overlay = document.querySelector('.overlay');
const modal = document.querySelector('.popup');
const embedModal = document.getElementById('loadingModal');

const apiKey = '581dc6f13406b18e91c38d94a12e26a5';
const movieInput = document.getElementById('movieInput');
const tvInput = document.getElementById('tvInput');
const movieSearchPopup = document.getElementById('movieSearchPopup');
const tvSearchPopup = document.getElementById('tvSearchPopup');
const movieError = document.getElementById('movieError');
const tvError = document.getElementById('tvError');
const movieCancelButton = document.getElementById('movieCancelBtn');
const tvCancelButton = document.getElementById('tvCancelBtn');
const tmdbEndpoint = 'https://api.themoviedb.org/3';

// let isBack = false;
var currentTvTmdbId = null;
var currentMovieTmdbId = null;
var tvHasSearched = false;
var movieHasSearched = false;
var movieNotFound = false;
var tvNotFound = false;
var requestIds = new Set();
let listenerIntervalId = null;
let isAborting = false;
let trackName = '';

// window.addEventListener('load', function () {
//   // Initialize
//   SpatialNavigation.init();

//   // Define navigable elements (anchors and elements with "focusable" class).
//   SpatialNavigation.add({
//     selector: '.focusable'
//   });

//   // Make the *currently existing* navigable elements focusable.
//   SpatialNavigation.makeFocusable();

//   // Focus the first navigable element.
//   SpatialNavigation.focus();
// });

// function loadScript(src) {
//   return new Promise(function (resolve, reject) {
//     if ($("script[src='" + src + "']").length === 0) {
//       var script = document.createElement('script');
//       script.onload = function () {
//         resolve();
//       };
//       script.onerror = function () {
//         reject();
//       };
//       script.src = src;
//       document.body.appendChild(script);
//     } else {
//       resolve();
//     }
//   });
// }

const proxyUrl = 'https://ely-teal.vercel.app/';
// const proxyUrl = 'https://m3u8-proxy.mayor.workers.dev/corsproxy/';

const options = {
  consistentIpForRequests: true,
  target: providers.targets.NATIVE
};

var isCordovaApp = typeof window.cordova !== 'undefined';
var isBrowser = isCordovaApp && window.cordova.platformId === 'browser';

// options[isBrowser ? 'proxiedFetcher' : 'fetcher'] = isBrowser
//   ? providers.makeSimpleProxyFetcher(proxyUrl, fetch)
//   : makeCordovaFetcher();

// const providersObject = providers.makeProviders(options);

let fetcher;

if (isBrowser) {
  fetcher = providers.makeSimpleProxyFetcher(proxyUrl, fetch);
} else {
  fetcher = makeCordovaFetcher(fetch);
}
const providersObject = providers
  .buildProviders()
  .setTarget(providers.targets.NATIVE) // target of where the streams will be used
  .setFetcher(fetcher) // fetcher, every web request gets called through here
  .enableConsistentIpForRequests()
  .addBuiltinProviders()
  .build();

if (isCordovaApp) {
  document.addEventListener('deviceready', init, false);
} else {
  init();
}

function init() {
  cordova.plugins.backgroundMode.enable();
  window.plugins.toast.show(
    'Created by Jerickson Mayor', // Message
    'long', // Duration: 'short' or 'long'
    'bottom', // Position: 'top', 'center', or 'bottom'
    function (success) {
      console.log('Toast displayed: ' + success);
    },
    function (error) {
      console.error('Toast error: ' + error);
    }
  );
  // cordova.plugins.backgroundMode.overrideBackButton();
  // Turn screen on
  // cordova.plugins.backgroundMode.wakeUp();
  // Turn screen on and show app even locked
  // cordova.plugins.backgroundMode.unlock();
  cordova.plugins.backgroundMode.on('activate', function () {
    cordova.plugins.backgroundMode.disableWebViewOptimizations();
  });
}

// window.addEventListener('offline', onOffline, false);

// // Handle the offline event
// function onOffline() {
//   alert('Offline: Connection has been lost');
// }

// window.addEventListener('online', () => {
//   alert('Online: Connection has been established');
// });
const captionTypes = {
  srt: 'srt',
  vtt: 'vtt'
};
function getCaptionTypeFromUrl(url) {
  const extensions = Object.keys(captionTypes);
  const type = extensions.find((v) => url.endsWith(`.${v}`));
  if (!type) return null;
  return type;
}
function labelToLanguageCode(label) {
  const code = ISO6391.getCode(label);
  if (code.length === 0) return null;
  return code;
}
function isValidLanguageCode(code) {
  if (!code) return false;
  return ISO6391.validate(code);
}

function normalizeTitle(title) {
  let titleTrimmed = title.trim().toLowerCase();
  if (titleTrimmed !== 'the movie' && titleTrimmed.endsWith('the movie')) {
    titleTrimmed = titleTrimmed.replace('the movie', '');
  }
  if (titleTrimmed !== 'the series' && titleTrimmed.endsWith('the series')) {
    titleTrimmed = titleTrimmed.replace('the series', '');
  }
  return titleTrimmed.replace(/['":]/g, '').replace(/[^a-zA-Z0-9]+/g, '_');
}

function compareTitle(a, b) {
  return normalizeTitle(a) === normalizeTitle(b);
}

function compareMedia(media, title, releaseYear) {
  // if no year is provided, count as if its the correct year
  const isSameYear = releaseYear === undefined ? true : media.releaseYear === releaseYear;
  return compareTitle(media.title, title) && isSameYear;
}

const inputElement = document.querySelector('.input-control input');
inputElement.addEventListener('focus', () => {
  // Scroll to the top with a smooth animation
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function areShowsSimilar(show1, show2, tolerance = 1) {
  // Check if either `numberOfSeasons` is missing, indicating a likely match on other factors
  if (!show1.numberOfSeasons || !show2.numberOfSeasons) {
    return false; // Cannot compare if `numberOfSeasons` is missing
  }

  const diff = Math.abs(show1.numberOfSeasons - show2.numberOfSeasons);

  // If the difference is within the tolerance, consider them similar
  return diff <= tolerance;
}

function toggleCancelButton(inputElement, cancelButton) {
  if (inputElement) {
    if (inputElement.value.length > 0) {
      cancelButton.style.display = 'block';
    } else {
      cancelButton.style.display = 'none';
    }
  }
}
function scrollToTop(popupElement) {
  popupElement.scrollTop = 0;
}

function clearInput(inputElement, cancelButton, popupElement, errorElement) {
  const currentTab = activeTab();
  inputElement.value = ''; // Clear input
  cancelButton.style.display = 'none'; // Hide cancel button
  clearError(inputElement);
  localStorage.setItem(currentTab === 'Movie' ? 'movieNotFound' : 'tvNotFound', false);
  if (currentTab === 'Movie') {
    movieHasSearched = false;
    movieNotFound = false;
  } else {
    tvNotFound = false;
    tvHasSearched = false;
  }
  // inputElement.style.border = '2px solid rgb(97, 97, 97)';
  popupElement.style.display = 'none';
  errorElement.textContent = ''; // Clear error message if input is empty
}
// Add event listener to clear input and hide cancel button
movieCancelButton.addEventListener(
  'click',
  clearInput.bind(null, movieInput, movieCancelButton, movieSearchPopup, movieError)
);
tvCancelButton.addEventListener('click', clearInput.bind(null, tvInput, tvCancelButton, tvSearchPopup, tvError));

// Add event listeners to the input elements
movieInput.addEventListener('input', toggleCancelButton.bind(null, movieInput, movieCancelButton));
tvInput.addEventListener('input', toggleCancelButton.bind(null, tvInput, tvCancelButton));

async function searchFunction(type) {
  const inputElement = type === 'movie' ? movieInput : tvInput;
  const popupElement = type === 'movie' ? movieSearchPopup : tvSearchPopup;
  const errorElement = type === 'movie' ? movieError : tvError;

  popupElement.classList.add('active');

  // const query = inputElement.value.trim();
  const query = inputElement.value;

  if (query.length === 0) {
    popupElement.style.display = 'none';
    errorElement.textContent = ''; // Clear error message if input is empty
    return;
  }
  const offset = type === 'tv' ? 0 : 0;

  // You can scroll to the bottom of the page here with the offset
  window.scrollTo({ top: document.body.scrollHeight - offset, behavior: 'smooth' });

  const response = await makeTMDBRequest(`${tmdbEndpoint}/search/${type}`, {
    query: `${query}`,
    page: 1
  });
  const data = await response.json();
  displayResults(data.results, type);
  clearError(inputElement);
  updateError(data.results.length, errorElement);
  positionPopup(inputElement, popupElement, 10, 2, -120);
  localStorage.setItem(type === 'movie' ? 'movieHasSearched' : 'tvHasSearched', false);
  if (type === 'movie') {
    movieHasSearched = false;
  } else {
    tvHasSearched = false;
  }
  // scrollToTop(popupElement);

  // Update popup position on window resize
  window.addEventListener('resize', function () {
    positionPopup(inputElement, popupElement, 10, 2, -120);
  });
}

function displayResults(results, type) {
  const popupElement = type === 'movie' ? movieSearchPopup : tvSearchPopup;
  popupElement.innerHTML = '';

  if (results.length === 0) {
    popupElement.style.display = 'none';
    return;
  }
  localStorage.setItem(type === 'movie' ? 'movieNotFound' : 'tvNotFound', false);
  if (type === 'movie') {
    movieNotFound = false;
  } else {
    tvNotFound = true;
  }
  // Create a container for search results
  const searchContainer = document.createElement('div');
  searchContainer.className = 'searchedContainer';

  results.slice(0, 50).forEach((result) => {
    const resultElement = document.createElement('div');
    resultElement.className = 'searchResult focusable';
    // resultElement.classList.add('fade-in'); // Adding fade-in animation class

    // Check if a poster path is available
    if (result.poster_path) {
      const imageUrl = `https://image.tmdb.org/t/p/w185${result.poster_path}`;
      const imageElement = document.createElement('img');
      imageElement.src = imageUrl;
      // imageElement.alt = result.title || result.name;
      imageElement.className = 'resultImage';
      resultElement.appendChild(imageElement);
    } else {
      // Use a placeholder image or background color if no poster path is available
      const placeholderElement = document.createElement('div');
      placeholderElement.className = 'placeholderImage';
      resultElement.appendChild(placeholderElement);
    }

    // Container for title and rating
    const infoContainer = document.createElement('div');
    infoContainer.className = 'infoContainer';

    const titleElement = document.createElement('span');
    titleElement.className = 'resultTitle';
    titleElement.id = 'dynamicTitle';
    titleElement.innerHTML = `${result.title || result.name}`;

    infoContainer.appendChild(titleElement);
    const yearElement = document.createElement('span');
    yearElement.className = 'resultYear';
    yearElement.style.color = 'white';
    yearElement.style.fontSize = '.8em';
    yearElement.innerHTML = `${
      type === 'movie'
        ? result.release_date
          ? ` (${result.release_date.slice(0, 4)})`
          : ' (N/A)'
        : result.first_air_date
        ? ` (${result.first_air_date.slice(0, 4)})`
        : ' (N/A)'
    }`;
    infoContainer.appendChild(yearElement);

    // Add yellow star rating using FontAwesome
    const ratingElement = document.createElement('div');
    ratingElement.className = 'starRating';
    const starIcon = document.createElement('span');
    starIcon.className = 'fas fa-star';
    starIcon.style.color = 'yellow'; // Set the star color to yellow
    starIcon.style.fontSize = '.6em'; // Adjust the star size
    const ratingText = document.createElement('span');
    ratingText.style.color = 'white'; // Set the text color to white
    ratingText.style.fontSize = '.8em'; // Adjust the star size
    ratingText.textContent = ` ${result.vote_average ? result.vote_average.toFixed(1) : 'N/A'}`; // Display rating with a single decimal point
    ratingElement.appendChild(starIcon);
    ratingElement.appendChild(ratingText);

    infoContainer.appendChild(ratingElement);
    resultElement.appendChild(infoContainer);

    resultElement.addEventListener('click', async () => {
      const inputElement = type === 'movie' ? movieInput : tvInput;
      const errorElement = type === 'movie' ? movieError : tvError;

      inputElement.value = result.title || result.name;

      try {
        let mediaDetails = null;

        if (type === 'movie') {
          movieNotFound = false;
          localStorage.setItem('movieHasSearched', 'true');
          movieHasSearched = true;
          mediaDetails = await getMovieMediaDetails(result.id);
          localStorage.setItem('currentMovieTmdbId', mediaDetails.tmdbId);
          localStorage.setItem('movieDetails', JSON.stringify(mediaDetails));
          currentMovieTmdbId = mediaDetails.tmdbId;
        } else if (type === 'tv') {
          tvNotFound = false;
          localStorage.setItem('tvHasSearched', 'true');
          tvHasSearched = true;
          mediaDetails = await getShowMediaDetails(result.id, 1, 1);
          localStorage.setItem('currentTvTmdbId', mediaDetails.tmdbId);
          localStorage.setItem('tvDetails', JSON.stringify(mediaDetails));
          currentTvTmdbId = mediaDetails.tmdbId;
        }

        // Your existing code...
      } catch (error) {
        console.error('Error fetching media details:', error);
        setError(errorElement, error.toString().replace(/^Error:\s*/, ''));
        localStorage.setItem(type === 'movie' ? 'movieNotFound' : 'tvNotFound', true);
        localStorage.setItem('currentTvTmdbId', null);
        localStorage.setItem('currentMovieTmdbId', null);
        localStorage.setItem('tvHasSearched', 'false');
        localStorage.setItem('movieHasSearched', 'false');
        if (type === 'movie') {
          movieHasSearched = false;
          movieNotFound = true;
        } else {
          tvHasSearched = false;
          tvNotFound = true;
        }
      }

      popupElement.style.display = 'none';
      // Add an event listener to inputElement to revert border color back to original when focused
      // inputElement.addEventListener('focus', function () {
      //   inputElement.style.borderColor = 'white';
      // });
    });

    searchContainer.appendChild(resultElement);
  });
  popupElement.appendChild(searchContainer);
  popupElement.style.display = 'block';
}
window.addEventListener('load', function () {
  const currentTab = activeTab();
  const tab = currentTab.toLowerCase() === 'tv' ? 'Tv' : currentTab;
  const storageKey = `${currentTab.toLowerCase()}Details`;
  const currentTmdbId = localStorage.getItem(`current${tab}TmdbId`);
  console.log(currentTmdbId);
  const hasSearched = localStorage.getItem(storageKey);
  const mediaDetails = JSON.parse(hasSearched);
  // Assign the retrieved currentTmdbId to the variable
  if (hasSearched) {
    // Assign only if the value exists in localStorage
    localStorage.setItem(currentTab === 'Movie' ? 'movieHasSearched' : 'tvHasSearched', true);
    localStorage.setItem(currentTab === 'Movie' ? 'currentMovieTmdbId' : 'currentTvTmdbId', mediaDetails.tmdbId);
    window[`current${tab}TmdbId`] = mediaDetails.tmdbId;
    if (currentTab === 'Movie') {
      movieHasSearched = true;
    } else {
      tvHasSearched = true;
    }
  } else {
    localStorage.setItem(currentTab === 'Movie' ? 'movieHasSearched' : 'tvHasSearched', false);
    localStorage.setItem(currentTab === 'Movie' ? 'currentMovieTmdbId' : 'currentTvTmdbId', null);
    window[`current${tab}TmdbId`] = null;
    if (currentTab === 'Movie') {
      movieHasSearched = false;
      movieNotFound = false;
    } else {
      tvHasSearched = false;
      tvNotFound = false;
    }
  }
  localStorage.setItem(currentTab === 'Movie' ? 'movieNotFound' : 'tvNotFound', false);
});
async function getMovieMediaDetails(id) {
  movieSearchPopup.style.display = 'none';
  try {
    const response = await makeTMDBRequest(`${tmdbEndpoint}/movie/${id}`, {
      append_to_response: 'external_ids'
    });

    const movie = await response.json();

    if (response.ok && movie.release_date) {
      return {
        type: 'movie',
        title: movie.title,
        releaseYear: Number(movie.release_date.split('-')[0]),
        tmdbId: id,
        imdbId: movie.imdb_id
      };
    } else {
      throw new Error('Failed to fetch movie details');
    }
  } catch (error) {
    console.error('Error fetching movie media details:', error.message);
    throw error; // Re-throw the error to handle it in the calling code
  }
}
document.addEventListener('DOMContentLoaded', () => {
  // Check if movieDetails is available in local storage
  const storedMovieDetails = localStorage.getItem('movieDetails');

  if (storedMovieDetails) {
    try {
      const movieDetails = JSON.parse(storedMovieDetails);

      // Set default values for movie input field based on movieDetails
      movieInput.value = movieDetails.title || '';
    } catch (error) {
      console.error('Error parsing stored movie details:', error);
    }
  }

  // Check if tvDetails is available in local storage
  const storedTvDetails = localStorage.getItem('tvDetails');

  if (storedTvDetails) {
    try {
      const tvDetails = JSON.parse(storedTvDetails);

      // Set default values for TV input field based on tvDetails
      tvInput.value = tvDetails.title || '';
    } catch (error) {
      console.error('Error parsing stored TV details:', error);
    }
  }
});

function getMediaDetails(type) {
  const storageKey = `${type}Details`;
  const storedDetails = localStorage.getItem(storageKey);

  const inputElement = `${type.toLowerCase()}Input`;
  const inputValue = `${window[inputElement].value}`;

  if (storedDetails) {
    try {
      const mediaDetails = JSON.parse(storedDetails);
      if (mediaDetails.title !== inputValue) {
      } else {
        return JSON.parse(storedDetails);
      }
    } catch (error) {
      console.error(`Error parsing stored ${type} details:`, error);
    }
  }

  return null;
}

async function getShowMediaDetails(id, seasonNumber, episodeNumber) {
  tvSearchPopup.style.display = 'none';

  try {
    const seriesResponse = await makeTMDBRequest(`${tmdbEndpoint}/tv/${id}`, {
      append_to_response: 'external_ids'
    });
    const series = await seriesResponse.json();

    if (!series.first_air_date) {
      throw new Error(`Has no first_air_date. Assuming unaired`);
    }

    const seasonResponse = await makeTMDBRequest(`${tmdbEndpoint}/tv/${id}/season/${seasonNumber}`);
    const season = await seasonResponse.json();

    const episodeResponse = await makeTMDBRequest(
      `${tmdbEndpoint}/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`
    );
    const episode = await episodeResponse.json();

    console.log(series);

    return {
      type: 'show',
      title: series.name,
      releaseYear: Number(series.first_air_date.split('-')[0]),
      tmdbId: id,
      episode: {
        number: episode?.episode_number,
        tmdbId: episode.id
      },
      season: {
        number: season?.season_number,
        tmdbId: season.id
      },
      imdbId: series.external_ids?.imdb_id,
      numberOfSeasons: series.last_episode_to_air?.season_number
    };
  } catch (error) {
    console.error('Error fetching show media details:', error.message);
    throw error; // Re-throw the error to handle it in the calling code
  }
}

async function makeTMDBRequest(url, params = {}) {
  const headers = {
    accept: 'application/json'
  };

  const requestURL = new URL(url);
  const key = apiKey;

  if (key.startsWith('ey')) {
    headers.authorization = `Bearer ${key}`;
  } else {
    requestURL.searchParams.append('api_key', key);
  }

  // Append additional query parameters
  Object.entries(params).forEach(([key, value]) => {
    requestURL.searchParams.append(key, value);
  });

  try {
    const response = await fetch(requestURL, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Error making TMDB request:', error);
    throw error; // Re-throw the error to handle it in the calling code
  }
}

async function isAvailable(searchString, type) {
  try {
    const response = await makeTMDBRequest(`${tmdbEndpoint}/search/${type}`, {
      query: searchString,
      api_key: apiKey
    });

    const data = await response.json();

    if (data && data.results && data.results.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

function updateError(resultsLength, errorElement) {
  const currentTab = activeTab();
  if (resultsLength === 0) {
    // errorElement.textContent = 'No matching suggestion found';
    setError(errorElement, 'No matching suggestion found');
    localStorage.setItem(currentTab === 'Movie' ? 'movieNotFound' : 'tvNotFound', true);
    localStorage.setItem(currentTab === 'Movie' ? 'movieHasSearched' : 'tvHasSearched', false);
    if (currentTab === 'Movie') {
      movieHasSearched = false;
      movieNotFound = true;
    } else {
      tvHasSearched = false;
      tvNotFound = true;
    }
  } else {
    errorElement.textContent = ''; // Clear error message if results are found
  }
}

function positionPopup(inputElement, popupElement, offsetTop = 0, offsetLeft = 0, offsetBottom = 0) {
  const inputRect = inputElement.getBoundingClientRect();

  // Calculate the center of the input element
  const inputCenterX = inputRect.left + inputRect.width / 2;

  // Set the position directly based on the input element's position
  popupElement.style.position = 'absolute';

  // Center the popup horizontally and add offsets
  popupElement.style.left = `${inputCenterX - popupElement.offsetWidth / 2 + offsetLeft}px`;
  // popupElement.style.top = `${inputRect.bottom + offsetTop}px`;
  popupElement.style.top = `${inputRect.bottom + window.scrollY + offsetTop}px`;

  // popupElement.style.bottom = `${offsetBottom}px`;
}

tvInput.oninput = function () {
  searchFunction('tv');
};

movieInput.oninput = function () {
  searchFunction('movie');
};

function isAndroidWithChromium() {
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  // const isChromiumBased = userAgent.match(/Chrome\/\d+/) !== null;
  // let isChromium = !!window.chrome;
  var isChromium = !!navigator.userAgentData && navigator.userAgentData.brands.some((data) => data.brand == 'Chromium');

  return isAndroid && isChromium;
}

function adjustTabIndicatorHeight(numberOfSources, offset = 100) {
  const tabIndicator = document.getElementById('navigation_menu');
  const navigationTabs = document.getElementById('navigation_tabs');

  // reset the height to avoid accumulation
  navigationTabs.style.height = '300px';

  if (numberOfSources > 0) {
    const tabHeight = navigationTabs.clientHeight / numberOfSources - offset;

    navigationTabs.style.height = `${tabHeight * numberOfSources}px`;
  }
}

function showScrapingScreen(sourcesIds, events) {
  if (sourcesIds.length < 1) {
    return;
  }
  // Code to show scraping screen

  const navigationTabs = document.getElementById('navigation_tabs');

  navigationTabs.innerHTML = '';
  activeTabIndex = -1;

  sourcesIds.forEach((source) => {
    const capitalizedSource = source.charAt(0).toUpperCase() + source.slice(1);
    const li = document.createElement('li');
    // li.classList.add('tab_inactive');
    li.setAttribute('data-source', source); // Add data-source attribute
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = capitalizedSource;
    a.style.cursor = 'default';
    a.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent the default click behavior
    });
    li.appendChild(a);
    navigationTabs.appendChild(li);
  });
  navigationTabs.scrollTo({ top: 0, behavior: 'smooth' });

  const scrapingScreen = document.getElementById('navigation_menu');
  if (scrapingScreen) {
    scrapingScreen.style.display = 'flex';
  }
  adjustTabIndicatorHeight(sourcesIds.length);
}
function hideScrapingScreen() {
  const scrapingScreen = document.getElementById('navigation_menu');
  if (scrapingScreen) {
    scrapingScreen.style.display = 'none';
  }
}
function shiftTabIndicator(id) {
  const navigationTabs = document.getElementById('navigation_tabs');
  const tabs = navigationTabs.querySelectorAll('li');

  let found = false;
  let targetTab = null;

  tabs.forEach((tab, index) => {
    const sourceId = tab.getAttribute('data-source').toLowerCase().trim();
    if (sourceId === id) {
      found = true;
      targetTab = tab;
    }
  });

  if (found && targetTab) {
    const navigationRect = navigationTabs.getBoundingClientRect();
    const targetTabRect = targetTab.getBoundingClientRect();

    // Calculate the amount needed to scroll to bring the target tab to the top
    // const scrollAmount = targetTabRect.top - navigationRect.top;
    const offset = 20; // Adjust this value to set the desired offset
    const scrollAmount =
      targetTabRect.top - navigationRect.top - (navigationTabs.clientHeight - targetTab.clientHeight) + offset;

    // Scroll the navigation tabs to bring the target tab to the top
    navigationTabs.scrollTo({
      top: navigationTabs.scrollTop + scrollAmount,
      behavior: 'smooth'
    });

    // Set the active tab
    setActiveTab(Array.from(tabs).indexOf(targetTab));
  } else {
    // If the ID is not found or doesn't match any tab, set the first tab as active
    setActiveTab(activeTabIndex);
  }
}

function getActiveTabId() {
  const activeTab = document.querySelector('.navigation_tabs li.tab_active');
  if (activeTab) {
    return activeTab.getAttribute('data-source').toLowerCase;
  } else {
    // If no active tab found, return null or some default value
    return null;
  }
}

let activeTabIndex = -1; // Initialize activeTabIndex to -1

function setActiveTab(index) {
  const navigationTabs = document.getElementById('navigation_tabs');
  const tabs = navigationTabs.querySelectorAll('li');

  if (index >= 0 && index < tabs.length && activeTabIndex !== index) {
    if (activeTabIndex !== -1) {
      // Check if there is an active tab
      tabs[activeTabIndex].classList.remove('tab_active');
      tabs[activeTabIndex].classList.add('tab_disabled');
    }

    tabs[index].classList.remove('tab_active');
    tabs[index].classList.add('tab_active');
    activeTabIndex = index;
  }
}
function handleUpdateEvent(updateEvent) {
  const { id, status } = updateEvent;

  if (status === 'notfound' || status === 'failure') {
    const navigationTabs = document.getElementById('navigation_tabs');
    const tabs = navigationTabs.querySelectorAll('li');

    let found = false;
    tabs.forEach((tab, index) => {
      // const sourceId = tab.textContent.trim().toLowerCase();
      const sourceId = tab.getAttribute('data-source').toLowerCase().trim(); // Get the data-source attribute of the tab
      if (sourceId === id && id.includes(sourceId)) {
        // Check if the ID matches or contains the source ID
        found = true;
        setActiveTab(index); // Move to the next tab
      }
    });

    // If the ID is not found or doesn't match any tab, set the first tab as active
    if (!found) {
      setActiveTab(activeTabIndex);
    }
  }
}
// Define event functions
const events = {
  update: (evt) => {
    console.log('Update event:', evt);
    // Handle update event, e.g., update UI with progress information
  },
  init: (evt) => {
    console.log('Init event:', evt);
    const sources = evt.sourceIds; // List of source IDs
    // Handle init event, e.g., initialize UI based on the list of scrapers
    showScrapingScreen(sources);
  },
  discoverEmbeds: (evt) => {
    console.log('Discover Embeds event:', evt);
    // Handle discover embeds event, e.g., update UI with discovered embeds
  },
  start: (id) => {
    // shiftTabIndicator(id);
    const activeTabId = getActiveTabId(); // Function to get the ID of the currently active tab
    if (id !== activeTabId) {
      // Check if the provided ID is different from the currently active tab ID
      console.log(`Start event for scraper with ID ${id}`);
      shiftTabIndicator(id);
      // Handle start event, e.g., update UI to indicate scraping has started
    }
  }
};

async function fetchOpenSubAsBase64(tmdbid, lang, season, episode) {
  try {
    const queryParams = new URLSearchParams({
      tmdbid: tmdbid,
      lang: lang,
      ...(season && { season: season }),
      ...(episode && { episode: episode })
    }).toString();

    const apiUrl = `https://sub-api-two.vercel.app/api/v2/sub/search?${queryParams}`;

    const fetcher = makeCordovaFetcher();
    const response = await fetcher(apiUrl, {
      method: 'GET'
    });

    if (response.statusCode !== 200) {
      throw new Error(`Failed to fetch subtitle content! Status: ${response.statusCode}`);
    }
    const subtitle = await response.body;
    return subtitle && subtitle.file ? subtitle.file.url : '';
  } catch (error) {
    console.error('Subtitles fetch error:', error);
    return null;
  }
}

async function fetchSubtitles(tmdbid, lang, season, episode) {
  try {
    // Set default values for lang and season
    lang = lang || 'en';
    const queryParams =
      `tmdbid=${tmdbid}&lang=${lang}` + (season ? `&season=${season}` : '') + (episode ? `&episode=${episode}` : '');
    const apiUrl = `https://sub-api-two.vercel.app/api/v2/sub/search?${queryParams}`;

    const options = {
      method: 'GET'
    };

    const response = await fetch(apiUrl, options);

    if (!response.ok) {
      throw new Error(`Subtitles fetch error! Status: ${response.status}`);
    }

    const subtitles = await response.json();
    return subtitles || null;
  } catch (error) {
    console.error('Subtitles fetch error:', error);
    return null;
  }
}

// Function to populate the dropdown
function populateDropdown(sourceScrapers, formId) {
  const dropdownId = `${formId}SourceSelect`;
  const dropdown = document.getElementById(dropdownId);

  // Clear existing options
  dropdown.innerHTML = '';

  if (sourceScrapers.length > 1) {
    // Add default "runAll" option
    const defaultOption = document.createElement('option');
    defaultOption.value = 'runAll';
    defaultOption.textContent = 'Run All';
    dropdown.appendChild(defaultOption);
  }

  // Add new options from sourceScrapers
  sourceScrapers.forEach((scraper) => {
    const option = document.createElement('option');
    option.value = scraper.id;
    option.textContent = scraper.id;
    dropdown.appendChild(option);
  });

  // Add event listener for selection change
  dropdown.addEventListener('change', function () {
    const selectedValue = dropdown.value;
    // Save selected value to localStorage
    localStorage.setItem(`${formId}SelectedSource`, selectedValue);
    // Perform any actions you want based on the selected value
    console.log('Selected Source:', selectedValue);
  });

  // Retrieve selected value from localStorage and set it in the dropdown
  let storedSelectedSource = localStorage.getItem(`${formId}SelectedSource`);

  // If not present in localStorage, set default to "runAll"
  if (!storedSelectedSource) {
    // storedSelectedSource = 'runAll';
    storedSelectedSource = sourceScrapers.length > 1 ? 'runAll' : sourceScrapers[0].id;
    localStorage.setItem(`${formId}SelectedSource`, storedSelectedSource);
  }

  dropdown.value = storedSelectedSource;
}
function makeFullUrl(url, ops) {
  let leftSide = (ops == null ? void 0 : ops.baseUrl) ?? '';
  let rightSide = url;
  if (leftSide.length > 0 && !leftSide.endsWith('/')) leftSide += '/';
  if (rightSide.startsWith('/')) rightSide = rightSide.slice(1);
  const fullUrl = leftSide + rightSide;
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://'))
    throw new Error(`Invald URL -- URL doesn't start with a http scheme: '${fullUrl}'`);
  const parsedUrl = new URL(fullUrl);
  Object.entries((ops == null ? void 0 : ops.query) ?? {}).forEach(([k, v]) => {
    parsedUrl.searchParams.set(k, v);
  });
  return parsedUrl.toString();
}

function serializeBody(body) {
  if (
    body === undefined ||
    body === null ||
    typeof body === 'string' ||
    body instanceof URLSearchParams ||
    body instanceof FormData ||
    body instanceof Uint8Array ||
    body instanceof ArrayBuffer ||
    typeof body === 'object'
  ) {
    if (body === undefined || body === null) {
      // No body to process
      return {
        headers: {},
        body: null
      };
    }
    if (body instanceof Uint8Array || body instanceof ArrayBuffer) {
      cordova.plugin.http.setDataSerializer('raw');
      return {
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body // Directly assign the raw data
      };
    }
    if (body instanceof FormData) {
      cordova.plugin.http.setDataSerializer('multipart');
      return {
        headers: {}, // Let the plugin set the correct Content-Type
        body
      };
    }

    if (body instanceof URLSearchParams) {
      cordova.plugin.http.setDataSerializer('urlencoded');
      const params = {};
      body.forEach((value, key) => {
        params[key] = value;
      });
      return {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      };
    }
    if (typeof body === 'string') {
      cordova.plugin.http.setDataSerializer('utf8');
      return {
        headers: {
          'Content-Type': 'text/plain'
        },
        body: body.toString()
      };
    }
    if (Array.isArray(body) || typeof body === 'object') {
      cordova.plugin.http.setDataSerializer('json');
      return {
        headers: {
          'Content-Type': 'application/json'
        },
        body // Directly assign the object or array, the plugin will handle JSON serialization
      };
    }
  }

  // If the body type is not handled
  throw new Error('Unsupported body type');
}

function getHeaders(list, res) {
  const output = new Headers();
  if (res.headers && list) {
    list.forEach((header) => {
      const realHeader = header.toLowerCase();
      const value = res.headers[realHeader];
      console.log('realheader', realHeader);
      console.log('value', value);
      if (value) {
        output.set(realHeader, value);
      }
    });
  }
  return output;
}

function makeCordovaFetcher() {
  const fetcher = (url, ops) => {
    return new Promise((resolve, reject) => {
      const fullUrl = makeFullUrl(url, ops);
      const serializedBody = serializeBody(ops.body);
      console.log('serializeBody', serializedBody.body);
      console.log('ops:', ops);
      if (isAborting) {
        return reject(new Error('Requests aborted'));
      }

      let requestId = cordova.plugin.http.sendRequest(
        fullUrl,
        {
          method: ops.method,
          headers: {
            ...serializedBody.headers,
            ...ops.headers
          },
          data: serializedBody.body
        },
        (res) => {
          if (isAborting) {
            abortRequest(requestId);
            return reject(new Error('Requests aborted'));
          }
          console.log('requestid:', requestId);
          console.log('Result:', res);
          const customizeResult = {
            body: res.headers['content-type'].includes('application/json') ? JSON.parse(res.data) : res.data,
            finalUrl: res.extraUrl ?? res.url,
            headers: getHeaders(ops.readHeaders, res),
            statusCode: res.status
          };
          console.log('customizeResult', customizeResult);
          console.log('getHeaders', customizeResult.headers?.get('date'));
          // removeRequestId(requestId);
          resolve(customizeResult);
        },
        (err) => {
          console.error(err);
          // removeRequestId(requestId);
          reject(err);
        }
      );
      requestIds.add(requestId);
    });
  };

  return fetcher;
}
function removeRequestId(requestId) {
  requestIds.delete(requestId);
}

const abortRequestWithDelay = (requestId) => {
  return new Promise((resolve) => {
    cordova.plugin.http.abort(
      requestId,
      (result) => {
        console.log('Aborted requestId:', requestId, 'Result:', result.aborted);
        removeRequestId(requestId);
        // resolve(result);
      },
      (response) => {
        console.error('Failed to abort requestId:', requestId, 'Error:', response.error);
        removeRequestId(requestId);
        // resolve(response);
      }
    );
  });
};

// const startRequestIdListener = (delay = 150) => {
//   if (listenerIntervalId !== null) {
//     console.log('Listener is already running.');
//     return;
//   }

//   isAborting = true;

//   listenerIntervalId = setInterval(async () => {
//     if (requestIds.size > 0) {
//       for (const requestId of requestIds) {
//         await abortRequestWithDelay(requestId);
//         // Adding delay between each abort
//         await new Promise((resolve) => setTimeout(resolve, delay));
//       }
//     }
//   }, delay);

//   console.log('Listener started.');
// };

const stopRequestIdListener = () => {
  if (listenerIntervalId !== null) {
    clearInterval(listenerIntervalId);
    listenerIntervalId = null;
    console.log('Listener stopped.');
  } else {
    console.log('No listener is running.');
  }
  isAborting = false;
};
function abortRequest(requestId) {
  cordova.plugin.http.abort(
    requestId,
    (result) => {
      console.log('Aborted requestId:', requestId, 'Result:', result.aborted);
      requestIds.delete(requestId);
    },
    (response) => {
      console.error('Failed to abort requestId:', requestId, 'Error:', response.error);
      requestIds.delete(requestId);
    }
  );
}

const startRequestIdListener = (delay = 150) => {
  if (listenerIntervalId !== null) {
    console.log('Listener is already running.');
    return;
  }

  isAborting = true;

  listenerIntervalId = setInterval(() => {
    if (requestIds.size > 0) {
      for (const requestId of requestIds) {
        abortRequest(requestId);
      }
    }
  }, delay);

  console.log('Listener started.');
};

//// Function to abort a specific request
// function abortRequest(requestId) {
//   cordova.plugin.http.abort(
//     requestId,
//     function (result) {
//       console.log('Aborted requestId:', requestId, 'Result:', result.aborted);
//       removeRequestId(requestId);
//     },
//     function (response) {
//       console.error('Failed to abort requestId:', requestId, 'Error:', response.error);
//       removeRequestId(requestId);
//     }
//   );
// }

// Function to abort all requests
function abortAllRequests() {
  if (requestIds.size > 0) {
    requestIds.forEach((requestId) => {
      abortRequest(requestId);
    });
  } else {
    console.log('No requests to abort.');
  }
}

const headerMap = {
  cookie: 'X-Cookie',
  referer: 'X-Referer',
  origin: 'X-Origin',
  'user-agent': 'X-User-Agent',
  'x-real-ip': 'X-X-Real-Ip'
};
const responseHeaderMap = {
  'x-set-cookie': 'Set-Cookie'
};

function makeSimpleProxyFetcher(proxyUrl) {
  const proxiedFetch = async (url, ops) => {
    const fetcher = makeCordovaFetcher(async (a, b) => {
      const res = await cordovaFetch(a, b);
      res.extraHeaders = new Headers();
      Object.entries(responseHeaderMap).forEach((entry) => {
        const value = res.headers.get(entry[0]);
        if (!value) return;
        res.extraHeaders?.set(entry[0].toLowerCase(), value);
      });
      res.extraUrl = res.headers.get('X-Final-Destination') ?? res.url;
      return res;
    });
    const fullUrl = makeFullUrl(url, ops);
    const headerEntries = Object.entries(ops.headers).map((entry) => {
      const key2 = entry[0].toLowerCase();
      if (headerMap[key2]) return [headerMap[key2], entry[1]];
      return entry;
    });
    return fetcher(proxyUrl, {
      ...ops,
      query: {
        destination: fullUrl
      },
      headers: Object.fromEntries(headerEntries),
      baseUrl: undefined
    });
  };
  return proxiedFetch;
}

// Call the function to populate the dropdown
const sources = providersObject.listSources();

populateDropdown(sources, 'tv');
populateDropdown(sources, 'movie');

async function runProviders(media) {
  console.clear();
  console.log(media);

  const dropdownId = `${media.type === 'movie' ? 'movie' : 'tv'}SourceSelect`;
  const dropdown = document.getElementById(dropdownId);
  const selectedSource = dropdown.value;

  const sourceScrapers = providersObject.listSources();
  const embedScrapers = providersObject.listEmbeds();
  console.log('List of sourceScrapers: ', sourceScrapers);
  console.log('List of embedScrapers: ', embedScrapers);

  resetTrackName();

  try {
    let response = null;

    // Check if the user has selected a specific source
    if (selectedSource !== 'runAll') {
      response = await providersObject.runSourceScraper({ id: selectedSource, media: media, events: events });
    } else {
      response = await providersObject.runAll({ media: media, events: events });
    }

    console.log(response);

    if (isAborting) {
      showModal('exclamation', 'Error', 'Request Aborted');
      return;
    }

    if (!response || (!response.stream && response.embeds.length === 0 && response.stream.length === 0)) {
      showModal('exclamation', 'Oops! Scraping Error', "Sorry, we couldn't retrieve any media.");
      return;
    }
    // const response = await providers.runAll({ media: media, sourceOrder: [`${selectedSource}`], events: events });
    if (Array.isArray(response.stream) && response.stream.length > 0) {
      const firstStream = response.stream[0];

      // Move properties of the first element directly to response.stream
      response.stream = { ...firstStream, ...response.stream[0]['0'] };

      // Remove '0' key from the original first element
      delete firstStream['0'];
    }

    if (!response.stream || (response.embeds && response.embeds.length > 0)) {
      let embeds = [];
      // const urlRegex = /^https?:\/\//;

      response.embeds.forEach((embed) => {
        // if (embed.url !== '' && urlRegex.test(embed.url)) {
        if (typeof embed.url === 'string' && embed.url.trim() !== '') {
          embeds.push(embed);
        }
      });

      if (embeds.length > 0) {
        showModal('check', 'Choose Embeds', '', true, '', false, embeds, true, false, media);
      } else {
        showModal('exclamation', 'No Embeds', 'Sorry, no embeds found. Please try again.', true, '', false, '', true);
      }
      return;
    }
    if (!response.stream.playlist && !response.stream.qualities && !response.stream.length > 0) {
      showModal('exclamation', 'Oops! Scraping Error', 'No Stream Found.');
      return;
    }

    console.log('Media found:', response);
    console.log('Source ID from :', response?.sourceId || selectedSource);
    console.log('Embed ID:', response?.embedId);

    document.getElementById('movieSubmitBtn').classList.remove('validated');
    document.getElementById('tvSubmitBtn').classList.remove('validated');

    let captions = response.stream?.captions || [];

    // Filter captions based on subtitle format (vtt or srt)
    let filteredCaptions = captions.filter((subtitle) => ['vtt', 'srt'].includes(subtitle.type));

    let englishCaptions = filteredCaptions.filter((subtitle) => subtitle.language === 'en');

    let mergedURL = null;
    let sub1 = '';

    if (englishCaptions.length > 0) {
      let englishCaption = englishCaptions[0];

      mergedURL = englishCaption.url;

      // sub1 = await fetchSubtitleAsBase64(mergedURL, response.stream?.headers);

      console.log(`English caption found (${englishCaption.language}, ${englishCaption.type}):`, mergedURL);
      sub1 = await uploadSubtitle(
        mergedURL,
        englishCaption.type,
        media,
        englishCaption.language,
        response.stream?.headers
      );
    } else {
      console.log('No English Caption found.');
    }

    let sub2 = await getSubtitles(media);

    let mediaUrl =
      response.stream?.type === 'hls'
        ? response.stream.playlist
        : response.stream?.type === 'file'
        ? getHighestQualityUrl(response)
        : '';

    let mergedSubtitles = [sub1, sub2].map((url) => url.replace(/:/g, '\\:')).join(':');
    // let mergedSubtitles = [sub1, sub2].join(':');

    let preferredHeaders = response.stream?.preferredHeaders;
    const headers = response.stream?.headers;

    let defaultUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0';

    // let sourceId = response?.sourceId || selectedSource;
    let defaultAcceptLanguage = 'en-US,en;q=0.5';

    let title = media.title;

    if (media.type === 'show' && media.season.number && media.episode.number) {
      // If the media type is 'show' and seasonNo and episodeNo are available
      let season = media.season.number < 10 ? `0${media.season.number}` : media.season.number;
      let episode = media.episode.number < 10 ? `0${media.episode.number}` : media.episode.number;

      let seasonEpisodeString = ` S${season}-E${episode}`;
      title += seasonEpisodeString;
    }

    let extras = [];

    if (preferredHeaders || headers) {
      const combinedHeaders = { ...headers, ...preferredHeaders };

      let userAgentValue;
      let acceptLanguageValue;
      let headerFields = Object.entries(combinedHeaders)
        .map(([key, value]) => {
          if (key.toLocaleLowerCase() === 'user-agent') {
            userAgentValue = value;
            return '';
          }
          if (key.toLocaleLowerCase() === 'accept-language') {
            acceptLanguageValue = value;
            return `Accept-Language: ${acceptLanguageValue.replace(/,/g, `\\\,`)}`;
          }
          return `${key}: ${value}`;
        })
        .filter(Boolean) // Remove empty strings from array
        .join(',');

      if (!userAgentValue) {
        userAgentValue = defaultUserAgent;
      }

      if (!acceptLanguageValue) {
        headerFields += `,Accept-Language: ${defaultAcceptLanguage.replace(/,/g, `\\\,`)}`;
      }
      headerFields = headerFields.replace(/,(?=,)/g, '');

      console.log('FINALHEADER:', headerFields);

      // extras.push({ name: '--user-agent', value: userAgentValue.replace(/,/g, `\\\,`), dataType: 'String' });
      extras.push({ name: '--user-agent', value: userAgentValue, dataType: 'String' });
      // extras.push({ name: '--http-header-fields', value: headerFields.replace(/,/g, `\\\,`), dataType: 'String' });
      extras.push({ name: '--http-header-fields', value: headerFields, dataType: 'String' });
    } else {
      // Both headers and preferredHeaders are falsy, set default values
      extras.push({ name: '--user-agent', value: defaultUserAgent, dataType: 'String' });
      extras.push({
        name: '--http-header-fields',
        value: `Accept-Language: ${defaultAcceptLanguage.replace(/,/g, `\\\,`)}`,
        dataType: 'String'
      });
    }

    if (sub1 || sub2) {
      // If either sub1 or sub2 is present, add a parameter representing a single subtitle file
      extras.push({ name: '--sub-file', value: sub1 || sub2, dataType: 'String' });
    }

    if (sub1 && sub2) {
      // If both sub1 and sub2 are present, add a parameter representing multiple subtitle files
      extras.push({ name: '--sub-files', value: mergedSubtitles, dataType: 'String' });
    }
    if (title) {
      extras.push({ name: '--force-media-title', value: title, dataType: 'String' });
    }

    extras.push({ name: '--force-seekable', value: 'yes', dataType: 'String' });
    extras.push({ name: '_useIntentFile', value: true, dataType: 'Boolean' });
    extras.push({ name: '--tls-verify', value: 'no', dataType: 'String' });
    extras.push({ name: '--vo', value: 'gpu', dataType: 'String' });
    extras.push({ name: '--gpu-context', value: 'android', dataType: 'String' });
    extras.push({ name: '--hwdec', value: 'mediacodec-copy', dataType: 'String' });
    extras.push({ name: '--cache', value: 'yes', dataType: 'String' });
    extras.push({ name: '--stream-buffer-size', value: '5MiB', dataType: 'String' });
    extras.push({ name: '--panscan', value: '1.0', dataType: 'String' });
    extras.push({ name: 'show_media_title', value: true, dataType: 'Boolean' });

    console.log(...extras);

    window.plugins.launcher.launch({
      packageName: 'is.xyz.mpv.ei.plus',
      uri: mediaUrl,
      dataType: 'video/any',
      extras: [...extras],
      successCallback: function (json) {
        if (json.isActivityDone) {
          if (json.extras && json.data) {
            if (json.data) {
              console.log('MPV Player stopped while on video: ' + json.data);
            }
            if (json.extras.position && json.extras.duration) {
              // MxPlayer stopped because the User quit
              console.log('User watched ' + json.extras.position + ' of ' + json.extras.duration + ' before quitting.');
            } else {
              console.log('MPV Player finished playing video without user quitting.');
            }
          } else {
            console.log('Playback finished, but we have no results from MPV Player.');
          }
        } else {
          console.log('MPV Player launched');
        }
      },
      errorCallback: function (err) {
        if (err === 'Application not found for uri.') {
          showModal(
            'exclamation',
            'Player Unavailable',
            'MPV Player is not installed on your device. Please install it and try again.',
            true, // You might want to make it cancelable based on your requirements
            'Download'
          );
        } else {
          console.log('There was an error launching MPV Player.', err);
        }
      }
    });

    // let extras2 = [];

    // if (preferredHeaders || headers) {
    //   let headerFields = Object.entries(preferredHeaders || headers)
    //     .map(([key, value]) => `${key}: ${value}`)
    //     .join(',');

    //   console.log(...headerFields);
    //   // Add "User-Agent" header alongside existing headers
    //   headerFields += `, User-Agent: ${userAgent}`;

    //   extras2.push({ name: 'headers', value: [headerFields], dataType: 'StringArray' });
    // }
    // if (title) {
    //   extras2.push({ name: 'title', value: title, dataType: 'String' });
    // }

    // extras2.push({ name: 'subs', value: [sub1, sub2], dataType: 'ParcelableArray', paType: 'Uri' });
    // extras2.push({ name: 'subs.enable', value: [sub1 || sub2], dataType: 'ParcelableArray', paType: 'Uri' });
    // extras2.push({ name: 'return_result', value: true, dataType: 'Boolean' });

    // console.log(...extras2);

    // window.plugins.launcher.launch({
    //   packageName: 'com.mxtech.videoplayer.ad',
    //   uri: mediaUrl,
    //   dataType: 'video/*',
    //   extras: [...extras2],
    //   successCallback: function (json) {
    //     if (json.isActivityDone) {
    //       if (json.extras && json.extras.end_by) {
    //         if (json.data) {
    //           console.log('MxPlayer stopped while on video: ' + json.data);
    //         }
    //         if (json.extras.end_by == 'user') {
    //           // MxPlayer stopped because the User quit
    //           console.log('User watched ' + json.extras.position + ' of ' + json.extras.duration + ' before quitting.');
    //         } else {
    //           console.log('MxPlayer finished playing video without user quitting.');
    //         }
    //       } else {
    //         console.log('Playback finished, but we have no results from MxPlayer.');
    //       }
    //     } else {
    //       console.log('MxPlayer launched');
    //     }
    //   },
    //   errorCallback: function (err) {
    //     alert('There was an error launching MxPlayer.');
    //   }
    // });
    hideModal();
    hideScrapingScreen();
  } catch (error) {
    // if (!error.message.includes('Canceled' || 'Socket closed')) {
    handleError(error);
    console.error('Error', error);
    hideScrapingScreen();
    // }
  } finally {
    hideScrapingScreen();
    stopButtonAnimation();
    document.getElementById('movieSubmitBtn').classList.remove('validated');
  }
}

function handleError(error) {
  if (error instanceof providers.NotFoundError) {
    hideModal();
    showModal('exclamation', "Source doesn't have this media", error);
  } else {
    hideModal();
    // if (!error.message.includes('Canceled')) {
    // }
    const status = error.status ?? '';
    const errorMessage = getErrorMessage(error);
    showModal('exclamation', `Error ${status}`, errorMessage);
  }
}
function getErrorMessage(error) {
  switch (true) {
    case error?.status && error.status !== '':
      try {
        return window.L.getReasonPhrase(error.status);
      } catch (e) {
        if (error?.error && error.error !== '') return error.error;
        else return 'Unknown error';
      }

    case error?.status === '':
      if (error?.error && error.error !== '') return error.error;
      else return 'Unknown error';

    default:
      return error.message ?? 'Unknown error';
  }
}

function getSubtitleMimeType(subtitleUrl) {
  const extension = subtitleUrl.split('.').pop().toLowerCase();

  switch (extension) {
    case 'vtt':
      return 'text/vtt';
    case 'srt':
      return 'application/x-subrip';
    default:
      throw new Error(`Unsupported subtitle format: .${extension}`);
  }
}

function stringToBase64(text) {
  const byteArray = new TextEncoder().encode(text);
  const base64String = btoa(String.fromCharCode(...byteArray));
  return base64String;
}

function stringToHex(text) {
  const byteArray = new TextEncoder().encode(text);
  const hexString = Array.prototype.map
    .call(byteArray, (byte) => {
      return ('0' + byte.toString(16)).slice(-2);
    })
    .join('');
  return hexString;
}

async function fetchSubtitleAsBase64(subtitleUrl, headers) {
  const fetcher = makeCordovaFetcher();

  try {
    const subtitleResponse = await fetcher(subtitleUrl, {
      method: 'GET',
      headers: { ...headers }
    });

    if (subtitleResponse.statusCode !== 200) {
      throw new Error(`Failed to fetch subtitle content! Status: ${subtitleResponse.statusCode}`);
    }

    const subtitleText = await subtitleResponse.body;

    const base64Subtitle = stringToBase64(subtitleText);

    return base64Subtitle;
  } catch (error) {
    console.error('Error:', error);
    return '';
  }
}

window.addEventListener('load', () => {
  const currentTab = activeTab();
  const inputElement = `${currentTab.toLowerCase()}Input`;
  const cancelElement = `${currentTab.toLowerCase()}CancelBtn`;
  toggleCancelButton(window[inputElement], window[cancelElement]);
});

async function uploadSubtitle(subtitleUrl, subtitleType, media, lang, headers) {
  const apiUrl = 'https://sub-api-two.vercel.app/api/v2/upload-sub';
  const fetcher = makeCordovaFetcher();

  try {
    // Fetch the subtitle content
    const subtitleResponse = await fetcher(subtitleUrl, {
      method: 'GET',
      headers: { ...headers }
    });
    console.log(subtitleResponse);

    if (subtitleResponse.statusCode !== 200) {
      throw new Error(`Failed to fetch subtitle content! Status: ${subtitleResponse.statusCode}`);
    }

    const subtitleBlob = new Blob([subtitleResponse.body]);

    let subtitleFileName;

    if (media.type === 'movie') {
      subtitleFileName = `${media.title}.${subtitleType}`;
    } else if (media.type === 'show') {
      subtitleFileName = `${media.title}-S${media.season.number}E${media.episode.number}.${subtitleType}`;
    }

    const formData = new FormData();
    formData.append('file', subtitleBlob, subtitleFileName);
    console.log('BLOB', subtitleBlob);

    const uploadOptions = {
      method: 'POST',
      body: formData,
      headers: {
        Language: lang
      }
    };

    const uploadResponse = await fetcher(apiUrl, uploadOptions);

    if (uploadResponse.statusCode !== 200) {
      throw new Error(`Upload file error! Status: ${uploadResponse.statusCode}`);
    }

    const uploadedFile = uploadResponse.body;

    return uploadedFile?.file?.url ?? '';
  } catch (error) {
    console.error('Error:', error);
    return '';
  }
}

async function getSubtitlesAsBase64(media) {
  const defaultLanguage = 'en';
  try {
    let subtitle;
    if (media.type === 'movie') {
      subtitle = await fetchOpenSubAsBase64(media.tmdbId, defaultLanguage);
    } else if (media.type === 'show') {
      subtitle = await fetchOpenSubAsBase64(media.tmdbId, defaultLanguage, media.season.number, media.episode.number);
    }

    let subtitleText = await fetchSubtitleAsBase64(subtitle.replace('http://', 'https://'), null);

    return subtitleText;
  } catch (error) {
    console.error('Error fetching subtitles:', error);
    return '';
  }
}

async function getSubtitles(media) {
  const defaultLanguage = 'en';
  try {
    let subtitle;
    if (media.type === 'movie') {
      subtitle = await fetchSubtitles(media.tmdbId, defaultLanguage);
    } else if (media.type === 'show') {
      subtitle = await fetchSubtitles(media.tmdbId, defaultLanguage, media.season.number, media.episode.number);
    }

    return subtitle && subtitle.file ? subtitle.file.url : '';
  } catch (error) {
    console.error('Error fetching subtitles:', error);
    return '';
  }
}

// Function to find the highest quality URL as a string
function getHighestQualityUrl(apiResponse) {
  const qualities = apiResponse?.stream?.qualities;

  if (!qualities) {
    return null;
  }

  const resolutions = Object.keys(qualities);

  if (resolutions.length === 0) {
    return null;
  }

  // Sort resolutions in descending order
  const sortedResolutions = resolutions.sort((a, b) => b - a);

  // Get the highest resolution
  const highestResolution = sortedResolutions[0];

  // Get the quality object for the highest resolution
  const highestQuality = qualities[highestResolution];

  // Return the URL of the highest quality
  return highestQuality?.url || null;
}
// function debounce(func, delay) {
//   let timeoutId;
//   return function () {
//     const context = this;
//     const args = arguments;
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => {
//       func.apply(context, args);
//     }, delay);
//   };
// }

// Add event listener to tab radios
tabRadios.forEach(async (radio) => {
  radio.addEventListener('change', async () => {
    const checkedTab = document.querySelector('.tab-wrapper input:checked').value;
    // const popupVariableName = `${checkedTab.toLowerCase()}SearchPopup`;

    const tab = checkedTab.toLowerCase() === 'tv' ? 'Tv' : checkedTab;
    console.log(tab);
    const storageKey = `${checkedTab.toLowerCase()}Details`;
    const currentTmdbId = localStorage.getItem(`current${tab}TmdbId`);
    const hasSearched = localStorage.getItem(storageKey);

    const inputElement = `${checkedTab.toLowerCase()}Input`;
    const inputValue = `${window[inputElement].value}`;
    const mediaDetails = JSON.parse(hasSearched);

    if (hasSearched && inputValue !== '') {
      if (mediaDetails.title.trim() === inputValue.trim()) {
        localStorage.setItem(checkedTab === 'Movie' ? 'movieHasSearched' : 'tvHasSearched', true);
        localStorage.setItem(checkedTab === 'Movie' ? 'movieNotFound' : 'tvNotFound', false);
        if (checkedTab === 'Movie') {
          movieHasSearched = true;
          movieNotFound = false;
        } else {
          tvHasSearched = true;
          tvNotFound = false;
        }
      } else {
        if (checkedTab === 'Movie') {
          movieHasSearched = false;
          movieNotFound = false;
        } else {
          tvHasSearched = false;
          tvNotFound = false;
        }
        localStorage.setItem(checkedTab === 'Movie' ? 'movieHasSearched' : 'tvHasSearched', false);
        localStorage.setItem(checkedTab === 'Movie' ? 'movieNotFound' : 'tvNotFound', true);
        if (checkedTab === 'Movie') {
          movieNotFound = true;
        } else {
          tvNotFound = true;
        }
      }
      window[`current${tab}TmdbId`] = mediaDetails.tmdbId;
      localStorage.setItem(checkedTab === 'Movie' ? 'currentMovieTmdbId' : 'currentTvTmdbId', mediaDetails.tmdbId);
    } else {
      if (checkedTab === 'Movie') {
        movieHasSearched = false;
        movieNotFound = false;
      } else {
        tvHasSearched = false;
        tvNotFound = false;
      }
      localStorage.setItem(checkedTab === 'Movie' ? 'movieHasSearched' : 'tvHasSearched', false);
      localStorage.setItem(checkedTab === 'Movie' ? 'currentMovieTmdbId' : 'currentTvTmdbId', null);
      window[`current${tab}TmdbId`] = null;
    }

    if (checkedTab.toLowerCase()) {
      const inputElement = `${checkedTab.toLowerCase()}Input`;
      const cancelElement = `${checkedTab.toLowerCase()}CancelBtn`;

      toggleCancelButton(window[inputElement], window[cancelElement]);
    }

    // Function to hide the popup
    const hidePopup = (popup) => {
      popup.style.display = 'none';
    };

    // Hide all popups before showing the relevant one
    hidePopup(movieSearchPopup);
    hidePopup(tvSearchPopup);
    // Toggle the active class based on the selected tab
    clearAllErrors();
    toggleForms(checkedTab);

    // Retrieve and populate input values
    const inputs = localStorage.getItem(`${checkedTab.toLowerCase()}Inputs`);
    if (inputs) {
      const parsedInputs = JSON.parse(inputs);

      Object.keys(parsedInputs).forEach((key) => {
        const inputElement = document.getElementById(`${checkedTab.toLowerCase()}${capitalizeFirstLetter(key)}`);
        if (inputElement) {
          inputElement.value = parsedInputs[key];
        }
      });
    }
    // Save the current tab to localStorage
    localStorage.setItem('selectedTab', checkedTab);
  });
});

const clearAllErrors = () => {
  const allInputs = document.querySelectorAll('.input-control input');
  allInputs.forEach((input) => {
    clearError(input);
  });
};

// Function to toggle forms based on the selected tab with animation
function toggleForms(tab) {
  const animationDuration = 200; // Set the animation duration in milliseconds

  // Define the opacity values for each form
  const movieFormOpacity = tab === 'Movie' ? 1 : 0;
  const tvFormOpacity = tab === 'TV' ? 1 : 0;

  // Show/hide forms based on opacity values
  movieContainer.style.display = movieFormOpacity > 0 ? 'block' : 'none';
  tvContainer.style.display = tvFormOpacity > 0 ? 'block' : 'none';

  // Animate the opacity of movieForm
  animateOpacity(movieContainer, movieFormOpacity, animationDuration);

  // Animate the opacity of tvForm
  animateOpacity(tvContainer, tvFormOpacity, animationDuration);
}

// Function to animate opacity
function animateOpacity(element, targetOpacity, duration) {
  const startOpacity = parseFloat(getComputedStyle(element).opacity);

  // Calculate the change in opacity per millisecond
  const deltaOpacity = (targetOpacity - startOpacity) / duration;

  // Start the animation
  const startTime = performance.now();

  function updateOpacity(currentTime) {
    const elapsed = currentTime - startTime;
    const newOpacity = startOpacity + deltaOpacity * elapsed;

    element.style.opacity = newOpacity;

    // Continue the animation until the duration is reached
    if (elapsed < duration) {
      requestAnimationFrame(updateOpacity);
    }
  }

  // Start the animation
  requestAnimationFrame(updateOpacity);
}

// Restore the selected tab from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
  const selectedTab = localStorage.getItem('selectedTab');
  if (selectedTab) {
    // Set the radio button and toggle forms
    document.getElementById(`${selectedTab.toLowerCase()}Tab`).checked = true;
    toggleForms(selectedTab);

    // Retrieve and populate input values
    const inputs = localStorage.getItem(`${selectedTab.toLowerCase()}Inputs`);
    if (inputs) {
      const parsedInputs = JSON.parse(inputs);

      Object.keys(parsedInputs).forEach((key) => {
        const inputElement = document.getElementById(`${selectedTab.toLowerCase()}${capitalizeFirstLetter(key)}`);
        if (inputElement) {
          inputElement.value = parsedInputs[key];
        }
      });
    }
  }
});

function capitalizeFirstLetter(string) {
  // Capitalize the first letter and handle 'Tmdbid' separately
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const setSuccess = (element) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector('.error');

  errorDisplay.innerText = '';
  inputControl.classList.add('success');
  inputControl.classList.remove('error');
};

const setError = (element, message) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector('.error');

  errorDisplay.innerText = message;
  inputControl.classList.add('error');
  inputControl.classList.remove('success');
};

const clearError = (element) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector('.error');

  errorDisplay.innerText = '';
  inputControl.classList.remove('error');
};

const isValidNumber = (input) => {
  const numberValue = Number(input);
  return !isNaN(numberValue) && typeof numberValue === 'number' && numberValue > 0;
};

// Function to clear stored input values from localStorage
const clearStoredInputs = (tab) => {
  // Validate tab value to prevent potential issues
  if (tab === 'movie' || tab === 'tv') {
    localStorage.removeItem(`${tab}Inputs`);
  } else {
    console.error('Invalid tab value. Please provide "movie" or "tv".');
  }
};
var debounce = function (func, threshold, execAsap) {
  var timeout;

  return function debounced() {
    var obj = this,
      args = arguments;
    function delayed() {
      if (!execAsap) func.apply(obj, args);
      timeout = null;
    }

    if (timeout) clearTimeout(timeout);
    else if (execAsap) func.apply(obj, args);

    timeout = setTimeout(delayed, threshold || 100);
  };
};
// Attach the debouncedLocalStorage function to the form submit event
document.getElementById('movieForm').addEventListener('submit', (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Call the debouncedLocalStorage function
  movieDebounceSubmit();
});

const movieDebounceSubmit = debounce(
  async () => {
    const status = validateInputs();

    if (movieNotFound && currentMovieTmdbId !== null) {
      setError(movieError, 'Failed to fetch movie details');
      return;
    }

    // Validate inputs
    if (status && movieHasSearched) {
      startButtonAnimation('Movie');
      overlay.classList.add('active');
      try {
        const mediaDetails = await getMovieMediaDetails(currentMovieTmdbId);
        runProviders(mediaDetails);
      } catch (error) {
        hideModal();
        stopButtonAnimation();
        if (error.message.includes('404')) {
          showModal(
            'exclamation',
            'Error fetching metadata',
            'The provided season or episode number is invalid or has not yet been released.'
          );
        } else if (error.message.includes('TMDB API error: ')) {
          showModal('exclamation', 'Error fetching metadata', 'An error occurred while fetching metadata from TMDB.');
        } else {
          showModal('exclamation', 'Error', error);
        }
      }
    }
  },
  300,
  true
);

// document.getElementById('movieForm').addEventListener('submit', async function (event) {
//   // Prevent the default form submission behavior
//   event.preventDefault();

//   const status = validateInputs();

//   const hasSearched = localStorage.getItem('movieHasSearched') === 'true';
//   const movieNotFound = localStorage.getItem('movieNotFound') === 'true';
//   const currentId = localStorage.getItem('currentMovieTmdbId');

//   if (movieNotFound && currentId !== null) {
//     setError(movieError, 'Failed to fetch movie details');
//     return;
//   }

//   // // Validate inputs
//   if (status && hasSearched) {
//     //   // Mark submit button as validated and start animation
//     //   document.getElementById('movieSubmitBtn').classList.add('validated');

//     startButtonAnimation('Movie');

//     //   // Show loading overlay
//     overlay.classList.add('active');

//     //   // Set a new debounce timeout
//     try {
//       const mediaDetails = await getMovieMediaDetails(currentId);

//       //     const inputFields = document.querySelectorAll('#movieForm input');
//       //     inputFields.forEach((input) => input.blur());
//       //     // Run providers with the created media object
//       runProviders(mediaDetails);
//     } catch (error) {
//       // Handle errors
//       hideModal();
//       stopButtonAnimation();
//       if (error.message.includes('404')) {
//         showModal(
//           'exclamation',
//           'Error fetching metadata',
//           'The provided season or episode number are invalid or have not yet been released.'
//         );
//       } else if (error.message.includes('TMDB API error: ')) {
//         showModal('exclamation', 'Error fetching metadata', 'An error occurred while fetching metadata from TMDB.');
//       } else {
//         showModal('exclamation', 'Error', error);
//       }
//       // document.getElementById('movieSubmitBtn').classList.remove('validated');
//     }
//   }
// });

document.getElementById('dismiss-popup-btn').addEventListener('click', function () {
  const buttonText = this.innerText;
  if (buttonText === 'Dismiss') {
    hideModal();
    document.getElementsByClassName('popup')[0].classList.remove('active');
  } else if (buttonText === 'Download') {
    const downloadLink = 'https://r2-api.mayor.workers.dev/mpv.apk';

    window.plugins.launcher.launch({
      packageName: 'com.android.chrome', // Use Chrome's package name for Android
      uri: downloadLink,
      successCallback: function (json) {
        console.log('Download started in Chrome');
      },
      errorCallback: function (err) {
        console.log('Error launching download link.', err);
      }
    });
  }
});

function showSpinner() {
  // Create a spinner container
  const spinnerContainer = document.createElement('div');
  spinnerContainer.classList.add('spinner-container');
  const loadingModal = document.getElementById('loadingModal');

  // Create the spinner element and add it to the container
  const spinnerElement = document.createElement('div');
  spinnerElement.classList.add('sk-wave');
  spinnerElement.innerHTML = `
    <div class="sk-wave-rect"></div>
    <div class="sk-wave-rect"></div>
    <div class="sk-wave-rect"></div>
    <div class="sk-wave-rect"></div>
    <div class="sk-wave-rect"></div>
  `;

  spinnerContainer.appendChild(spinnerElement);

  // Append the spinner container to the modal content
  loadingModal.appendChild(spinnerContainer);
}

function hideSpinner() {
  // Find the spinner container
  const spinnerContainer = document.querySelector('.spinner-container');
  const loadingModal = document.getElementById('loadingModal');

  // Remove the spinner container if it exists
  if (spinnerContainer) {
    loadingModal.removeChild(spinnerContainer);
  }
}

document.getElementById('close-popup-btn').addEventListener('click', function () {
  document.getElementsByClassName('popup')[0].classList.remove('active');
  hideModal();
});

document.getElementById('back-btn').addEventListener('click', function () {
  document.getElementById('loadingModal').classList.remove('active');
  hideSpinner();
  // isBack = true;
  // cordovaFetch.cancelAllRequests();
  abortAllRequests();
});

function resetTrackName() {
  trackName = ''; // Set trackName to an empty string or initial value
}
function addTrackName(newTrackName) {
  if (newTrackName) {
    // Trim whitespace and avoid duplicate track names
    newTrackName = newTrackName.trim();
    if (newTrackName && !trackName.split(', ').includes(newTrackName)) {
      // If trackName is not empty, add a comma before appending the new track name
      trackName = trackName ? `${trackName}, ${newTrackName}` : newTrackName;
    }
  }
}

async function runEmbedScraper(embed, media) {
  const dropdownId = `${media.type === 'movie' ? 'movie' : 'tv'}SourceSelect`;
  const dropdown = document.getElementById(dropdownId);
  const selectedSource = dropdown.value;

  showSpinner();
  resetTrackName();

  try {
    const response = await providersObject.runEmbedScraper({ id: embed.embedId, url: embed.url });

    if (!response || (!response.stream && response.embeds.length === 0 && response.stream.length === 0)) {
      hideSpinner();
      showResultModal('exclamation', 'Oops! Scraping Error', 'No Stream Found.');
      return;
    }

    if (Array.isArray(response.stream) && response.stream.length > 0) {
      const firstStream = response.stream[0];

      // Move properties of the first element directly to response.stream
      response.stream = { ...firstStream, ...response.stream[0]['0'] };

      // Remove '0' key from the original first element
      delete firstStream['0'];
    }

    if (!response.stream.playlist && !response.stream.qualities && !response.stream.length > 0) {
      hideSpinner();
      showResultModal('exclamation', 'Oops! Scraping Error', 'No Stream Found.');
      return;
    }

    console.log('Media found:', response);
    console.log('Source ID:', response?.sourceId || selectedSource);
    console.log('Embed ID:', response?.embedId || embed.embedId);

    document.getElementById('movieSubmitBtn').classList.remove('validated');
    document.getElementById('tvSubmitBtn').classList.remove('validated');

    // const captions = response.stream?.captions || [];
    let captions = response.stream?.captions;

    // Filter captions based on subtitle format (vtt or srt)
    let filteredCaptions = captions.filter((subtitle) => ['vtt', 'srt'].includes(subtitle.type));

    let englishCaptions = filteredCaptions.filter((subtitle) => subtitle.language === 'en');

    let mergedURL = null;
    let sub1 = '';

    if (englishCaptions.length > 0) {
      let englishCaption = englishCaptions[0];

      mergedURL = englishCaption.url;

      const base64Subtitle = await fetchSubtitleAsBase64(mergedURL, response.stream?.headers);
      if (base64Subtitle) {
        const subMime = getSubtitleMimeType(mergedURL);
        const dataScheme = `data://${subMime};base64,${base64Subtitle}`;
        sub1 = dataScheme;
        addTrackName('English (Default)');
      }

      // console.log(`English caption found (${englishCaption.language}, ${englishCaption.type}):`, mergedURL);
      // sub1 = await uploadSubtitle(
      //   mergedURL,
      //   englishCaption.type,
      //   media,
      //   englishCaption.language,
      //   response.stream?.headers
      // );
    } else {
      console.log('No English Caption found.');
    }

    // let sub2 = await getSubtitles(media);
    let sub2 = '';
    let base64Subtitle2 = await getSubtitlesAsBase64(media);
    if (base64Subtitle2) {
      const subMime = 'application/x-subrip';
      const dataScheme = `data://${subMime};base64,${base64Subtitle2}`;
      sub2 = dataScheme;
      addTrackName('English (OpenSubtitle)');
    }

    let mediaUrl =
      response.stream?.type === 'hls'
        ? response.stream?.playlist
        : response.stream?.type === 'file'
        ? getHighestQualityUrl(response)
        : '';

    let mergedSubtitles = [sub1, sub2].map((url) => url.replace(/:/g, '\\:')).join(':');
    // const mergedSubtitles = [sub1, sub2].join(':');

    let preferredHeaders = response.stream?.preferredHeaders;
    let headers = response.stream?.headers;

    console.log('PreferredHeaders', preferredHeaders);
    console.log('Headers', headers);

    const defaultUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0';
    const defaultAcceptLanguage = 'en-US,en;q=0.5';

    // let sourceId = response?.sourceId || selectedSource;

    let title = media.title;

    if (media.type === 'show' && media.season.number && media.episode.number) {
      // If the media type is 'show' and seasonNo and episodeNo are available
      let season = media.season.number < 10 ? `0${media.season.number}` : media.season.number;
      let episode = media.episode.number < 10 ? `0${media.episode.number}` : media.episode.number;

      let seasonEpisodeString = ` S${season}-E${episode}`;
      title += seasonEpisodeString;
    }

    // if (!isBack) {
    // Create an <a> element
    hideSpinner();
    hideModal();
    hideEmbedModal();

    let extras = [];

    if (preferredHeaders || headers) {
      const combinedHeaders = { ...headers, ...preferredHeaders };

      let userAgentValue;
      let acceptLanguageValue;

      let headerFields = Object.entries(combinedHeaders)
        .map(([key, value]) => {
          if (key.toLocaleLowerCase() === 'user-agent') {
            userAgentValue = value;
            return '';
          }
          if (key.toLocaleLowerCase() === 'accept-language') {
            acceptLanguageValue = value;
            return `Accept-Language: ${acceptLanguageValue.replace(/,/g, `\\\,`)}`;
          }
          return `${key}: ${value}`;
        })
        .filter(Boolean) // Remove empty strings from array
        .join(',');

      if (!userAgentValue) {
        userAgentValue = defaultUserAgent;
      }

      if (!acceptLanguageValue) {
        headerFields += `,Accept-Language: ${defaultAcceptLanguage.replace(/,/g, `\\\,`)}`;
      }
      // Remove extra commas
      headerFields = headerFields.replace(/,(?=,)/g, '');

      console.log('FINALHEADERS:', headerFields);

      // extras.push({ name: '--user-agent', value: userAgentValue.replace(/,/g, `\\\,`), dataType: 'String' });
      extras.push({ name: '--user-agent', value: userAgentValue, dataType: 'String' });
      // extras.push({ name: '--http-header-fields', value: headerFields.replace(/,/g, `\\\,`), dataType: 'String' });
      extras.push({ name: '--http-header-fields', value: headerFields, dataType: 'String' });
    } else {
      // Both headers and preferredHeaders are falsy, set default values
      extras.push({ name: '--user-agent', value: defaultUserAgent, dataType: 'String' });
      extras.push({
        name: '--http-header-fields',
        value: `Accept-Language: ${defaultAcceptLanguage.replace(/,/g, `\\\,`)}`,
        dataType: 'String'
      });
    }

    if (sub1 || sub2) {
      // If either sub1 or sub2 is present, add a parameter representing a single subtitle file
      extras.push({ name: '--sub-file', value: sub1 || sub2, dataType: 'String' });
    }

    if (sub1 && sub2) {
      // If both sub1 and sub2 are present, add a parameter representing multiple subtitle files
      // extras.push({ name: '--sub-files', value: mergedSubtitles, dataType: 'String' });
    }
    if (title) {
      extras.push({ name: '--force-media-title', value: title, dataType: 'String' });
    }

    extras.push({ name: '--force-seekable', value: 'yes', dataType: 'String' });
    extras.push({ name: '_useIntentFile', value: true, dataType: 'Boolean' });
    extras.push({ name: '--tls-verify', value: 'no', dataType: 'String' });
    extras.push({ name: 'track-names', value: trackName, dataType: 'String' });
    extras.push({ name: '--vo', value: 'gpu', dataType: 'String' });
    extras.push({ name: '--gpu-context', value: 'android', dataType: 'String' });
    extras.push({ name: '--hwdec', value: 'mediacodec-copy', dataType: 'String' });
    extras.push({ name: '--cache', value: 'yes', dataType: 'String' });
    extras.push({ name: '--stream-buffer-size', value: '1MiB', dataType: 'String' });
    extras.push({ name: '--panscan', value: '1.0', dataType: 'String' });
    extras.push({ name: 'show_media_title', value: true, dataType: 'Boolean' });

    console.log(...extras);

    window.plugins.launcher.launch({
      packageName: 'is.xyz.mpv.ei.plus',
      uri: mediaUrl,
      dataType: 'video/any',
      extras: [...extras],
      successCallback: function (json) {
        if (json.isActivityDone) {
          if (json.extras && json.data) {
            if (json.data) {
              console.log('MPV Player stopped while on video: ' + json.data);
            }
            if (json.extras.position && json.extras.duration) {
              // MxPlayer stopped because the User quit
              console.log('User watched ' + json.extras.position + ' of ' + json.extras.duration + ' before quitting.');
            } else {
              console.log('MPV Player finished playing video without user quitting.');
            }
          } else {
            console.log('Playback finished, but we have no results from MPV Player.');
          }
        } else {
          console.log('MPV Player launched');
        }
      },
      errorCallback: function (err) {
        console.log('There was an error launching MPV Player.', err);
      }
    });

    // let extras2 = [];

    // if (preferredHeaders || headers) {
    //   let headerFields = Object.entries(preferredHeaders || headers)
    //     .map(([key, value]) => `${key}: ${value}`)
    //     .join(',');

    //   // Add "User-Agent" header alongside existing headers
    //   headerFields += `, User-Agent: ${userAgent}`;

    //   console.log(...headerFields);

    //   extras2.push({ name: 'headers', value: headerFields, dataType: 'String' });
    // }
    // if (title) {
    //   extras2.push({ name: 'title', value: title, dataType: 'String' });
    // }

    // extras2.push({ name: 'subs', value: [sub1, sub2], dataType: 'ParcelableArray', paType: 'Uri' });
    // extras2.push({ name: 'subs.enable', value: [sub1 || sub2], dataType: 'ParcelableArray', paType: 'Uri' });
    // extras2.push({ name: 'return_result', value: true, dataType: 'Boolean' });

    // console.log(...extras2);

    // window.plugins.launcher.launch({
    //   packageName: 'com.mxtech.videoplayer.ad',
    //   uri: mediaUrl,
    //   dataType: 'video/*',
    //   extras: [...extras2],
    //   successCallback: function (json) {
    //     if (json.isActivityDone) {
    //       if (json.extras && json.extras.end_by) {
    //         if (json.data) {
    //           console.log('MxPlayer stopped while on video: ' + json.data);
    //         }
    //         if (json.extras.end_by == 'user') {
    //           // MxPlayer stopped because the User quit
    //           console.log(
    //             'User watched ' + json.extras.position + ' of ' + json.extras.duration + ' before quitting.'
    //           );
    //         } else {
    //           console.log('MxPlayer finished playing video without user quitting.');
    //         }
    //       } else {
    //         console.log('Playback finished, but we have no results from MxPlayer.');
    //       }
    //     } else {
    //       console.log('MxPlayer launched');
    //     }
    //   },
    //   errorCallback: function (err) {
    //     alert('There was an error launching MxPlayer.');
    //   }
    // });
    // } else {
    // if (!isBack) {
    hideSpinner();
    hideModal();
    hideEmbedModal();
    // }
    // }
  } catch (err) {
    // console.log('Failed to scrape embed', err, 'Dismiss');
    hideSpinner();
    const status = err.status ?? '';
    const errorMessage = getErrorMessage(err);
    showResultModal('exclamation', `Error ${status}`, errorMessage);
    //   handleError(error);
    //   console.error('Error', error);
    //   hideScrapingScreen();
    //   // }
    // } finally {
    //   hideScrapingScreen();
    //   stopButtonAnimation();
    //   document.getElementById('movieSubmitBtn').classList.remove('validated');

    console.error('Error', err);
    // Handle the error, e.g., show an error message in the modal
  }
}
function showResultModal(iconType, title, description, buttonText) {
  const resultModal = document.getElementById('loadingModal');
  document.documentElement.scrollTop = 0;

  // Remove existing result content if any
  const existingResultContent = resultModal.querySelector('.result-content');
  if (existingResultContent) {
    resultModal.removeChild(existingResultContent);
  }

  // Clear existing content inside the result content
  const resultContent = document.createElement('div');
  resultContent.classList.add('result-content');

  // Create a new icon element
  const iconElement = document.createElement('div');
  iconElement.classList.add('icon');

  // Create the checkmark icon inside the icon element
  const checkIcon = document.createElement('i');
  checkIcon.classList.add('fa', 'fa-' + iconType);
  iconElement.id = 'popup-icon';

  const iconColor = iconType === 'check' ? '#34f234' : iconType === 'exclamation' ? '#f23434' : '';
  // Apply the color to the icon
  checkIcon.style.color = iconColor;

  // Set border color based on iconType
  const borderColor = iconType === 'check' ? '#34f234' : iconType === 'exclamation' ? '#f23434' : '';
  // Apply the border color to the icon
  iconElement.style.border = `2px solid ${borderColor}`;

  // Create title element
  const titleElement = document.createElement('div');
  titleElement.classList.add('title');
  titleElement.innerText = title;

  // Create description element
  const descriptionElement = document.createElement('div');
  descriptionElement.classList.add('description');
  descriptionElement.innerText = description;

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('dismiss-btn');

  // Create button element
  const buttonElement = document.createElement('button');
  buttonElement.id = 'show-result-btn';
  buttonElement.classList.add('dismiss');
  buttonElement.innerText = buttonText;

  // Append the checkmark icon to the icon element
  iconElement.appendChild(checkIcon);
  resultContent.appendChild(iconElement);

  // Append elements to resultContent
  resultContent.appendChild(titleElement);
  resultContent.appendChild(descriptionElement);
  if (iconType === 'check') {
    buttonContainer.appendChild(buttonElement);
  }
  resultContent.appendChild(buttonContainer);
  resultModal.appendChild(resultContent);
}
function showModalResultReset() {
  const resultModal = document.getElementById('loadingModal');
  const existingResultContent = resultModal.querySelector('.result-content');
  if (existingResultContent) {
    resultModal.removeChild(existingResultContent);
  }
}

function showModal(
  iconType,
  title,
  description,
  showCloseBtn = false,
  buttonLabel,
  enableButton = true,
  // embedIds = [],
  embedData = [],
  enableEmbedIds = false,
  showResultModal = false,
  media
) {
  const iconElement = document.getElementById('popup-icon');
  const titleElement = document.getElementById('popup-title');
  const descriptionElement = document.getElementById('popup-description');
  const buttonText = document.getElementById('dismiss-popup-btn');
  const closeButton = document.getElementById('close-popup-btn');
  const border = document.querySelector('.icon');
  const embedTitle = document.querySelector('.embed-title');
  const loadingModal = document.getElementById('loadingModal');
  if (showResultModal) {
    // Get the z-index of the loading modal
    const loadingModalZIndex = window.getComputedStyle(loadingModal).zIndex;

    // Set the z-index of the modal to be higher than the loading modal
    modal.style.zIndex = parseInt(loadingModalZIndex) + 1;
  }

  document.documentElement.scrollTop = 0;

  // Set the content based on parameters
  iconElement.className = 'fa fa-' + iconType;
  titleElement.innerText = title;
  // descriptionElement.innerText = description;

  buttonText.style.display = enableButton ? 'block' : 'none';

  //Show backdrop
  document.getElementById('backdrop').style.display = 'block';

  // Set styles based on iconType
  if (iconType === 'check') {
    iconElement.style.color = '#34f234'; // Green color for success
    border.style.border = '2px solid #34f234';
    buttonText.innerText = buttonLabel ? buttonLabel : '';
    closeButton.style.display = showCloseBtn ? 'block' : 'none';
  } else if (iconType === 'exclamation') {
    iconElement.style.color = '#f23434'; // Red color for warning
    border.style.border = '2px solid #f23434';
    buttonText.innerText = buttonLabel ? buttonLabel : 'Dismiss';
    closeButton.style.display = showCloseBtn ? 'block' : 'none';
  }
  // Clear previous content in descriptionElement
  descriptionElement.innerHTML = '';

  // Add embed IDs to descriptionElement if enabled
  if (enableEmbedIds && embedData.length > 0) {
    embedData.forEach((embed) => {
      const embedIdElement = document.createElement('div');
      embedIdElement.textContent = embed.embedId;
      embedIdElement.classList.add('embed-id');

      // Add click event listener for each embed ID
      embedIdElement.addEventListener('click', () => {
        // Do something with the clicked embedId
        // showSpinner();
        // Show the loading modal
        document.getElementById('loadingModal').classList.add('active');
        embedTitle.innerText = `${embed.embedId}`;
        showModalResultReset();
        runEmbedScraper(embed, media);
        // isBack = false;
      });

      descriptionElement.appendChild(embedIdElement);
      descriptionElement.classList.add('scrollable');
    });
  } else {
    // Use plain text if embedIds are not enabled or empty
    descriptionElement.innerText = description;
  }

  // Show the modal
  overlay.classList.add('active');
  modal.classList.add('active');
}

// Function to hide the modal
function hideModal() {
  document.getElementById('backdrop').style.display = 'none';

  overlay.classList.remove('active');
  modal.classList.remove('active');
}

function hideEmbedModal() {
  const loadingModal = document.getElementById('loadingModal');
  if (loadingModal) {
    overlay.classList.remove('active');
    embedModal.classList.remove('active');
  }
}
document.getElementById('tvForm').addEventListener('submit', (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();
  // Call the debouncedLocalStorage function
  tvDebounceSubmit();
});

const tvDebounceSubmit = debounce(
  async () => {
    const status = validateInputs();

    if (tvNotFound && currentTvTmdbId !== null) {
      setError(tvError, 'Failed to fetch TV show details');
      return;
    }
    if (status && tvHasSearched) {
      // const tmdbid = tvTmdbId.value;
      const seasonNo = tvSeasonNo.value;
      const episodeNo = tvEpisodeNo.value;

      // Save input values to localStorage
      // const tvInputs = { tmdbid, seasonNo, episodeNo };
      const tvInputs = { seasonNo, episodeNo };
      localStorage.setItem('tvInputs', JSON.stringify(tvInputs));
      console.log(seasonNo, episodeNo);
      console.log(tvInputs);

      // Mark submit button as validated and start animation
      // document.getElementById('tvSubmitBtn').classList.add('validated');
      startButtonAnimation('TV');

      // Show loading overlay
      overlay.classList.add('active');

      // Set the flag to indicate that a request is in progress

      try {
        // Fetch metadata
        // const metadata = await getMetadata('tv', tmdbid);
        // const media = getMediaDetails('tv');

        const mediaDetails = await getShowMediaDetails(currentTvTmdbId, seasonNo, episodeNo);
        localStorage.setItem('tvDetails', JSON.stringify(mediaDetails));

        // Unfocus all input fields
        // const inputFields = document.querySelectorAll('#tvForm input');
        // inputFields.forEach((input) => input.blur());

        // Run providers with the created media object
        runProviders(mediaDetails);
      } catch (error) {
        // Handle errors
        hideModal();
        stopButtonAnimation();
        if (error.message.includes('404')) {
          showModal(
            'exclamation',
            'Error fetching metadata',
            'The provided season or episode number are invalid or have not yet been released.'
          );
        } else if (error.message.includes('TMDB API error: ')) {
          showModal('exclamation', 'Error fetching metadata', 'An error occurred while fetching metadata from TMDB.');
        } else {
          showModal('exclamation', 'Error', error);
        }
        // document.getElementById('tvSubmitBtn').classList.remove('validated');
      }
    }
  },
  300,
  true
);

// document.getElementById('tvForm').addEventListener('submit', async function (event) {
//   // Prevent the default form submission behavior

//   event.preventDefault();

//   const status = validateInputs();
//   // let media = getMediaDetails('tv');
//   const hasSearched = localStorage.getItem('tvHasSearched') === 'true';
//   const tvNotFound = localStorage.getItem('tvNotFound') === 'true';
//   const currentId = localStorage.getItem('currentTvTmdbId');

//   if (tvNotFound && currentId !== null) {
//     setError(tvError, 'Failed to fetch TV show details');
//     return;
//   }

//   if (status && hasSearched) {
//     // const tmdbid = tvTmdbId.value;
//     const seasonNo = tvSeasonNo.value;
//     const episodeNo = tvEpisodeNo.value;

//     // Save input values to localStorage
//     // const tvInputs = { tmdbid, seasonNo, episodeNo };
//     const tvInputs = { seasonNo, episodeNo };
//     localStorage.setItem('tvInputs', JSON.stringify(tvInputs));
//     console.log(seasonNo, episodeNo);
//     console.log(tvInputs);

//     // Mark submit button as validated and start animation
//     // document.getElementById('tvSubmitBtn').classList.add('validated');
//     startButtonAnimation('TV');

//     // Show loading overlay
//     overlay.classList.add('active');

//     // Set the flag to indicate that a request is in progress

//     try {
//       // Fetch metadata
//       // const metadata = await getMetadata('tv', tmdbid);
//       // const media = getMediaDetails('tv');

//       const mediaDetails = await getShowMediaDetails(currentTvTmdbId, seasonNo, episodeNo);
//       localStorage.setItem('tvDetails', JSON.stringify(mediaDetails));

//       // Unfocus all input fields
//       // const inputFields = document.querySelectorAll('#tvForm input');
//       // inputFields.forEach((input) => input.blur());

//       // Run providers with the created media object
//       runProviders(mediaDetails);
//     } catch (error) {
//       // Handle errors
//       hideModal();
//       stopButtonAnimation();
//       if (error.message.includes('404')) {
//         showModal(
//           'exclamation',
//           'Error fetching metadata',
//           'The provided season or episode number are invalid or have not yet been released.'
//         );
//       } else if (error.message.includes('TMDB API error: ')) {
//         showModal('exclamation', 'Error fetching metadata', 'An error occurred while fetching metadata from TMDB.');
//       } else {
//         showModal('exclamation', 'Error', error);
//       }
//       // document.getElementById('tvSubmitBtn').classList.remove('validated');
//     }
//   }
// });

const validateInput = (element, validationFn) => {
  const value = element.value.trim();
  const validationMessage = validationFn(value);
  const currentTab = activeTab();

  // Always show an error if the input is empty
  if (value.length === 0) {
    setError(element, validationMessage);
    clearStoredInputs(currentTab.toLowerCase());
    return false;
  }

  if (validationMessage) {
    setError(element, validationMessage);
    return false;
  }

  clearError(element);
  return true;
};

// Replace the existing handleBlur function with this simplified version
const handleBlur = (element, validationFn) => {
  element.addEventListener('blur', () => {
    const value = element.value.trim();

    if (value.length > 0) {
      const validationMessage = validationFn(value);

      if (validationMessage) {
        setError(element, validationMessage);
      } else {
        setSuccess(element);
      }
    } else {
      clearError(element);
    }
  });

  // Add a keydown event listener to prevent tabbing if the current field is not validated
  element.addEventListener('keydown', (event) => {
    const value = element.value.trim();
    const validationMessage = validationFn(value);

    if (event.key === 'Tab' && validationFn(value)) {
      setError(element, validationMessage);
      // Prevent default Tab behavior if the field is not validated
      event.preventDefault();
    }
  });
};

const validateInputs = () => {
  const currentTab = activeTab();

  // Validate movieInput and tvInput
  const isMovieInputValid = validateInput(movieInput, (value) => {
    if (!value) return 'Search for a movie first';
    return null;
  });

  const isTvInputValid = validateInput(tvInput, (value) => {
    if (!value) return 'Search for a TV show first';
    return null;
  });

  if (currentTab === 'TV') {
    const isSeasonNoValid = validateInput(seasonNo, (value) => {
      if (!value) return 'Season No. is required';
      if (!isValidNumber(value)) return 'Provide a valid Season No.';
      return null;
    });
    const isEpisodeNoValid = validateInput(episodeNo, (value) => {
      if (!value) return 'Episode No. is required';
      if (!isValidNumber(value)) return 'Provide a valid Episode No.';
      return null;
    });

    return isTvInputValid && isSeasonNoValid && isEpisodeNoValid;
  }

  return isMovieInputValid;
};

handleBlur(movieInput, (value) => {
  if (!value) return 'Search for a movie first';
  return null;
});
handleBlur(tvInput, (value) => {
  if (!value) return 'Search for a TV show first';
  return null;
});
handleBlur(seasonNo, (value) => {
  if (!value) return 'Season No. Year is required';
  if (!isValidNumber(value)) return 'Provide a valid Season No.';
  return null;
});
handleBlur(episodeNo, (value) => {
  if (!value) return 'Episode No. Year is required';
  if (!isValidNumber(value)) return 'Provide a valid Episode No.';
  return null;
});

const activeTab = () => {
  const checkedRadio = document.querySelector('.tab-wrapper input:checked');
  const checkedTab = checkedRadio ? checkedRadio.value : null;
  return checkedTab;
};
const isButtonInAnimationState = (tab) => {
  const btnClass = tab === 'TV' ? '.tvbtn' : '.btn';
  const btn = document.querySelector(btnClass);
  return btn.classList.contains('loading'); // Returns true if button has the 'loading' class
};

const startButtonAnimation = (tab) => {
  const btnClass = tab === 'TV' ? '.tvbtn' : '.btn';
  const btn = document.querySelector(btnClass);
  // Disable the button
  btn.classList.add('loading');
  btn.disabled = true; // Add this line to disable the button
};

const stopButtonAnimation = () => {
  const tvbtn = document.querySelector('.tvbtn');
  const btn = document.querySelector('.btn');
  tvbtn.classList.remove('loading');
  btn.classList.remove('loading');
  btn.disabled = false; // Add this line to enable the button
  tvbtn.disabled = false; // Add this line to enable the button
};

function isPopupShown() {
  const modal = document.querySelector('.popup');
  return modal.classList.contains('active');
}
function cancelRequestsForTag(tag) {
  return new Promise(function (resolve, reject) {
    cordovaFetch.cancelCallWithTag(
      tag,
      function (success) {
        console.log("Requests with tag '" + tag + "' canceled.");
        resolve(success);
      },
      function (error) {
        console.error("Error canceling requests with tag '" + tag + "':", error);
        reject(error);
      }
    );
  });
}
// Function to cancel all requests
function cancelAllRequests() {
  return new Promise(function (resolve, reject) {
    cordovaFetch.cancelAllRequests(
      function (success) {
        console.log('All requests canceled.');
        resolve(success);
      },
      function (error) {
        console.error('Error canceling all requests:', error);
        reject(error);
      }
    );
  });
}
// cancelAllRequests()
//     .then(function() {
//         console.log("Cancellation of all requests completed.");
//     })
//     .catch(function(error) {
//         console.error("Error canceling all requests:", error);
//     });
const cancelRequestsOneByOneWithDelay = async () => {
  for (let i = 1; i <= 20; i++) {
    const tag = 'test';
    console.log('Canceling requests for tag:', tag);
    try {
      await cancelRequestsForTag(tag);
      console.log('Cancellation for tag', tag, 'completed.');
    } catch (error) {
      console.error('Error canceling requests for tag', tag, ':', error);
    }
    // Add a delay of 1000 milliseconds (1 second) between cancellations
    await new Promise((resolve) => setTimeout(resolve, 100)); // Adjust the delay time as needed
  }
};

function unPack(code) {
  function indent(code) {
    try {
      var tabs = 0,
        old = -1,
        add = '';
      for (var i = 0; i < code.length; i++) {
        if (code[i].indexOf('{') != -1) tabs++;
        if (code[i].indexOf('}') != -1) tabs--;

        if (old != tabs) {
          old = tabs;
          add = '';
          while (old > 0) {
            add += '\t';
            old--;
          }
          old = tabs;
        }

        code[i] = add + code[i];
      }
    } finally {
      tabs = null;
      old = null;
      add = null;
    }
    return code;
  }

  var env = {
    eval: function (c) {
      code = c;
    },
    window: {},
    document: {}
  };

  eval('with(env) {' + code + '}');

  code = (code + '')
    .replace(/;/g, ';\n')
    .replace(/{/g, '\n{\n')
    .replace(/}/g, '\n}\n')
    .replace(/\n;\n/g, ';\n')
    .replace(/\n\n/g, '\n');

  code = code.split('\n');
  code = indent(code);

  code = code.join('\n');
  return code;
}
