var eventsMediator = {
    events: {},
    on: function (eventName, callbackfn) {
        this.events[eventName] = this.events[eventName]
            ? this.events[eventName]
            : [];
        this.events[eventName].push(callbackfn);
    },
    emit: function (eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (callBackfn) {
                callBackfn(data);
            });
        }
    },
};

class statsModule {
    currentPage = 1
    numberOfMovies = 20
    topRatedMovie = {
        movieName: "",
        rating: ""
    }
    constructor() {
        eventsMediator.on("movies.loaded", (numberOfMovies) => {
            this.numberOfMovies = numberOfMovies
            this.render()
        })
        eventsMediator.on("topRated.update", (topRatingMovie) => {
            this.topRatedMovie.movieName = topRatingMovie.original_title
            this.topRatedMovie.rating = topRatingMovie.vote_average
        })
        eventsMediator.on("next.pressed", () => {
            this.currentPage++
        })
        eventsMediator.on("prev.pressed", () => {
            this.currentPage--
        })
        this.render()
    }
    render() {
        $(".curr-page").text("Current Page: " + this.currentPage)
        $(".number").text("Number of Movies: " + this.numberOfMovies)
        $(".top-rated").text("Top rated movie: " + this.topRatedMovie.movieName)
        $(".rating").text("Rating: " + this.topRatedMovie.rating)
    }
}

class moviesModule {
    movies = []
    page = 1
    constructor() {
        eventsMediator.on("next.pressed", () => {
            this.page++
            this.fetchMovies()
        })
        eventsMediator.on("prev.pressed", () => {
            this.page--
            this.fetchMovies()
        })
        this.fetchMovies()
    }
    fetchMovies() {
        $.ajax({
            url: `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${this.page}`,
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTQ2MzgxMDgzNzliODFjZWNiYTE4ZmI4MDMzZTBiNSIsInN1YiI6IjY0NzczZTc3MDA1MDhhMDExNmQ1NTViNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5aEDM2F7O2mNwqxa-ktSn9xPYzgqNlL-KLaNEyHQxfg'
            }, success: (result) => {
                $(".myloader").toggleClass("d-none");
                this.movies = result.results
                this.render()
                this.getTopRating()
                eventsMediator.emit("movies.loaded", this.movies.length);
            }
        });
    }
    getTopRating() {
        const topRatingMovie = this.movies.reduce(
            (prev, current) => {
                return prev.vote_average > current.vote_average ? prev : current
            })
        eventsMediator.emit("topRated.update", topRatingMovie);
    }
    render() {
        $(".my-grid").html("")
        for (let i = 0; i < this.movies.length; i++) {
            let movie = this.movies[i]
            let imgUrl = `https://www.themoviedb.org/t/p/w600_and_h900_bestv2/${movie.poster_path}`
            $(".my-grid").append(
                `<div class=" card card${i}">
                    <img src="${imgUrl}" class="img-fluid card-img-top">
                    <div class="card-body text-center">
                        <h6>${movie.original_title}</h6>
                        <h6>${movie.vote_average}</h6>
                    </div>
                </div>`)

            $(".card" + i).on('click', function () {
                eventsMediator.emit("modal.opened", { name: movie.original_title, rating: movie.vote_average, img: imgUrl, desc: movie.overview });
            });
        }

    }
}

class modalModule {
    constructor() {
        $("#close-btn").on('click', () => {
            this.closeModal()
        });
        eventsMediator.on("modal.opened", this.openModal)
    }
    openModal({ name, rating, img, desc }) {
        $(".my-modal-view").toggleClass("d-none")
        $(".movie-name").text(name)
        $(".movie-rate").text("IMDB Rating: " + rating + "/10")
        $(".movie-desc").text(desc)
        $(".movie-img").attr("src", img)
    }
    closeModal() {
        $(".my-modal-view").toggleClass("d-none")
    }
}

$(document).ready(function () {
    const stats = new statsModule()
    const movie = new moviesModule()
    const modal = new modalModule()
    
    $(".nextBtn").on('click', function () {
        $(".myloader").toggleClass("d-none");
        eventsMediator.emit("next.pressed");
    })
    $(".prevBtn").on('click', function () {
        if (movie.page > 1) {
            $(".myloader").toggleClass("d-none");
            eventsMediator.emit("prev.pressed");
        }
    })
});


