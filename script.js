const apiKey = "c14b7edc";
let currentSearch = "Batman";
let currentPage = 1;
let totalPages = 1;
let favList = [];
let currentTab = "search";
let currentDetailMovie = null; // Храним текущий открытый фильм

if (localStorage.getItem('myMovieFavs')) {
    favList = JSON.parse(localStorage.getItem('myMovieFavs'));
}

if (localStorage.getItem('myTheme') == 'dark') {
    document.body.className = 'dark';
}

loadMovies();

function loadMovies() {
    document.getElementById('loadingText').style.display = 'block';
    document.getElementById('moviesList').innerHTML = '';
    document.getElementById('pagBlock').style.display = 'none';

    const url = 'https://www.omdbapi.com/?apikey=' + apiKey + '&s=' + currentSearch + '&page=' + currentPage;

    fetch(url)
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {
        document.getElementById('loadingText').style.display = 'none';

        if (data.Response == "True") {
            totalPages = Math.ceil(data.totalResults / 10);
            showMoviesArray(data.Search);

            document.getElementById('pagBlock').style.display = 'block';
            document.getElementById('pageNum').innerText = currentPage + ' из ' + totalPages;
        
            document.getElementById('btnPrev').disabled = (currentPage === 1);
            document.getElementById('btnNext').disabled = (currentPage === totalPages);
        } else {
            document.getElementById('moviesList').innerHTML = '<p>Фильмы не найдены!</p>';
        }
    })
    .catch(function(err) {
        console.log(err);
        document.getElementById('loadingText').innerText = 'Ошибка запроса!';
    });
}

function showMoviesArray(arr) {
    let html = '';

    for (let i = 0; i < arr.length; i++) {
        const film = arr[i];
        let poster = film.Poster;
        if (poster == 'N/A') {
            poster = 'https://via.placeholder.com/300x450?text=No+Poster';
        }

        const isFav = checkIsFav(film.imdbID);
        const starIcon = isFav ? '❤️' : '🤍';
         

        html = html + 
        '<div class="card" onclick="openFilmDetails(\'' + film.imdbID + '\')">' +
            '<div class="fav-star" onclick="clickFav(event, \'' + film.imdbID + '\', \'' + film.Title.replace(/'/g, "") + '\', \'' + film.Year + '\', \'' + poster + '\')">' + starIcon + '</div>' +
            '<img src="' + poster + '">' +
            '<div class="card-info">' +
                '<div class="card-title">' + film.Title + '</div>' +
                '<div class="card-year">' + film.Year + '</div>' +
            '</div>' +
        '</div>';
    }

    document.getElementById('moviesList').innerHTML = html;
}

function searchFilm() {
    const text = document.getElementById('searchInput').value;
    if (text != '') {
        currentSearch = text;
        currentPage = 1;
        showSearchTab();
    }
}

function openFilmDetails(id) {
    document.getElementById('searchBlock').style.display = 'none';
    document.getElementById('detailsBlock').style.display = 'block';
    document.getElementById('detailsContent').innerHTML = 'Загрузка информации...';

    const url = 'https://www.omdbapi.com/?apikey=' + apiKey + '&i=' + id + '&plot=full';

    fetch(url)
    .then(function(res) {
        return res.json();
    })
    .then(function(film) {
        let poster = film.Poster;
        if (poster == 'N/A') {
            poster = 'https://via.placeholder.com/300x450?text=No+Poster';
        }

        // Сохраняем данные фильма
        currentDetailMovie = {
            imdbID: film.imdbID,
            Title: film.Title,
            Year: film.Year,
            Poster: poster
        };

        renderDetailsContent(film);
    });
}

function renderDetailsContent(film) {
    const isFav = checkIsFav(film.imdbID);
    const btnText = isFav ? '❤️️ В избранном' : '🤍 Добавить в избранное';
    const btnClass = isFav ? 'btn-fav active' : 'btn-fav';
    const html = 
    '<img src="' + currentDetailMovie.Poster + '">' +
    '<div>' +
        '<h2>' + film.Title + ' (' + film.Year + ')</h2>' +
        '<p><b>Жанр:</b> ' + film.Genre + '</p>' +
        '<p><b>Рейтинг IMDb:</b> ⭐️ ' + film.imdbRating + '</p>' +
        '<p><b>Актеры:</b> ' + film.Actors + '</p>' +
        '<p><b>Сюжет:</b> ' + film.Plot + '</p>' +
        '<button id="btnDetailsFav" class="' + btnClass + '" onclick="toggleDetailsFav()">' + btnText + '</button>' +
    '</div>';

    document.getElementById('detailsContent').innerHTML = html;
}

function toggleDetailsFav() {
    if (!currentDetailMovie) return;

    const foundIndex = favList.findIndex(f => f.imdbID === currentDetailMovie.imdbID);

    if (foundIndex > -1) {
        favList.splice(foundIndex, 1);
    } else {
        favList.push(currentDetailMovie);
    }

    localStorage.setItem('myMovieFavs', JSON.stringify(favList));

    // Обновляем вид кнопки
    const isFav = checkIsFav(currentDetailMovie.imdbID);
    const btn = document.getElementById('btnDetailsFav');
    if (btn) {
        btn.innerText = isFav ? '❤️ В избранном' : '🤍 Добавить в избранное';
        btn.className = isFav ? 'btn-fav active' : 'btn-fav';
    }
}

function closeDetails() {
    document.getElementById('detailsBlock').style.display = 'none';
    document.getElementById('searchBlock').style.display = 'block';
    currentDetailMovie = null;
}

function checkIsFav(id) {
    for (let i = 0; i < favList.length; i++) {
        if (favList[i].imdbID == id) {
            return true;
        }
    }
    return false;
}

function clickFav(e, id, title, year, poster) {
    e.stopPropagation();

    let foundIndex = -1;
    for (let i = 0; i < favList.length; i++) {
        if (favList[i].imdbID == id) {
            foundIndex = i;
            break;
        }
    }

    if (foundIndex > -1) {
        favList.splice(foundIndex, 1);
    } else {
        favList.push({
            imdbID: id,
            Title: title,
            Year: year,
            Poster: poster
        });
    }

    localStorage.setItem('myMovieFavs', JSON.stringify(favList));

    if (currentTab == 'favorites') {
        showFavTab();
    } else {
        loadMovies();
    }
}

function showSearchTab() {
    currentTab = 'search';
    document.getElementById('blockTitle').innerText = 'Результаты поиска';
    closeDetails();
    loadMovies();
}

function showFavTab() {
    currentTab = 'favorites';
    closeDetails();
    document.getElementById('blockTitle').innerText = 'Избранные фильмы';
    document.getElementById('pagBlock').style.display = 'none';

    if (favList.length == 0) {
        document.getElementById('moviesList').innerHTML = '<p>В избранном пока ничего нет!</p>';
    } else {
        showMoviesArray(favList);
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage = currentPage + 1;
        loadMovies();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage = currentPage - 1;
        loadMovies();
    }
}

function toggleTheme() {
    if (document.body.className == 'dark') {
        document.body.className = '';
        localStorage.setItem('myTheme', 'light');
    } else {
        document.body.className = 'dark';
        localStorage.setItem('myTheme', 'dark');
    }
}