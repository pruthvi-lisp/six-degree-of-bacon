# Six Degrees of Kevin Bacon



You can see this app in action at http://six-degrees-of-kevin-bacon.beaunus.com/.

## Motivation

Wouldn't it be cool if you could visualize how performers and movies are connected?

You could see a collection of movies that have the same actors and actors who have been in the same movies.

## Goal

### MVP

1.  The user inputs two actors' names.
1.  The backend calculates the connections between the two actors and sends a response.
1.  The "connection" is displayed as a graph on a white page.

## Data

### Data model

The data is represented in a graph. There are two kinds of nodes:

- person (actors, directors, etc.)
- work (movie, tv show)

An edge between nodes implies that the _person_ appeared in the _movie_.

![screenshot of simple graph](./public/img/six-degrees-of-kevin-bacon.png "screenshot of simple graph")

### Data Source

Data comes from [The Movie Database API](https://developers.themoviedb.org/3). We use three main queries:

- [GET /search/person](https://developers.themoviedb.org/3/search/search-people) - Get a person_id from the String that is entered on the web form.
- [GET /person/{person_id}/movie_credits](https://developers.themoviedb.org/3/people/get-person-movie-credits) - Get the movies that a person was in.
- [GET /search/movie](https://developers.themoviedb.org/3/search/search-movies) - Get a movie_id from the String that is entered on the web form.
- [GET /movie/{movie_id}/credits](https://developers.themoviedb.org/3/movies/get-movie-credits) - Get the people that were in a movie.

## How to use it

```sh
# Install dependencies

yarn install
# or
npm install
```

```sh
# Create .env file

cp .env.default .env
```

In order to interface with The Movie Database API, you will need an [API key](https://developers.themoviedb.org/3/getting-started/introduction).

```sh
# Start the application

yarn start
# or
npm start
```



Thank you for your interest in this project.
