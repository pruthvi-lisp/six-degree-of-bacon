import axios from "axios";
import express from "express";
import winston from "winston";

const THE_MOVIE_DB_ENDPOINT = "https://api.themoviedb.org/3";

const loggerFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.simple()
);

const logger = winston.createLogger({
  format: loggerFormat,
  level: "info",
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production")
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.combine(winston.format.colorize(), loggerFormat)
      ),
    })
  );

export const router = express.Router();

router.get("/", async (req, res) => {
  let result;
  if (Array.isArray(req.query.actor)) {
    console.log(`${new Date()} - API QUERY REQUESTED - ${req.query.actor}`);
    result = await getShortestPaths(req.query.actor);
  }
  res.status(200).json(result);
});

async function getShortestPaths(actorNames) {
  logger.debug("getShortestPaths", actorNames);
  const personToMovies = {};
  const nodesToExamine = [];
  for (const actorName of actorNames) {
    const person = await getPerson(actorName);
    personToMovies[person.id] = undefined;
    nodesToExamine.push(person);
  }
  let commonMovies = getCommonMovies(personToMovies);
  while (commonMovies.size < 1) {
    for (const person in personToMovies) {
      if (personToMovies[person] === undefined) {
        personToMovies[person] = await getMovies(person);
      }
    }
    commonMovies = getCommonMovies(personToMovies);
  }
  return getPaths(actorNames, commonMovies);
}

function getPaths(actorNames, commonMovies) {
  logger.debug("getPaths", actorNames, commonMovies);

  const result = { links: [], nodes: [] };
  for (const actorName of actorNames) {
    result.nodes.push({ group: 1, id: actorName });
    for (const movieJSON of commonMovies) {
      const movie = JSON.parse(movieJSON);
      result.links.push({ source: actorName, target: movie.name, value: 1 });
    }
  }
  for (const movieJSON of commonMovies) {
    const movie = JSON.parse(movieJSON);
    result.nodes.push({ group: 2, id: movie.name });
  }
  return result;
}

function getCommonMovies(personToMovies) {
  logger.debug("getCommonMovies", personToMovies);
  const personIds = Object.keys(personToMovies);
  const arrayOfMovies = personToMovies[personIds[0]];
  if (arrayOfMovies === undefined) return new Set();
  let commonMovies = new Set(arrayOfMovies.map((x) => JSON.stringify(x)));
  for (let i = 1; i < personIds.length; ++i) {
    const movies = personToMovies[personIds[i]];
    commonMovies = new Set(
      movies
        .filter((x) => commonMovies.has(JSON.stringify(x)))
        .map((x) => JSON.stringify(x))
    );
  }
  return commonMovies;
}

async function getPerson(personName) {
  logger.debug("getPerson", personName);
  const query = "/search/person";
  const url = `${THE_MOVIE_DB_ENDPOINT}${query}?api_key=${
    process.env.THE_MOVIE_DB_API_KEY
  }&query=${encodeURI(personName)}`;
  const allData = (await axios.get(url)).data.results[0];
  return { id: allData.id, name: allData.name, type: "person" };
}

async function getMovies(personId) {
  logger.info("getMovies", { personId });
  const query = `/person/${personId}/combined_credits`;
  const url = `${THE_MOVIE_DB_ENDPOINT}${query}?api_key=${process.env.THE_MOVIE_DB_API_KEY}`;
  const allData = (await axios.get(url)).data.cast;
  const result = [];
  for (const work of allData) {
    if (work.original_title) {
      result.push({ id: work.id, name: work.original_title, type: "movie" });
    }
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getPeople(movieId) {
  logger.info("getPeople", movieId);
  const query = `/movie/${movieId}/credits`;
  const url = `${THE_MOVIE_DB_ENDPOINT}${query}?api_key=${process.env.THE_MOVIE_DB_API_KEY}`;
  const allData = (await axios.get(url)).data.cast;
  const result = [];
  for (const person of allData) {
    result.push({ id: person.id, name: person.name, type: "person" });
  }
  return result;
}
