const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

//Get list of movies API
app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT 
     movie_name
    FROM
     movie;`
  const movieArray = await db.all(getMoviesQuery)
  response.send(
    movieArray.map(eachMovie => convertDbObjectToResponseObject(eachMovie)),
  )
})

//Add movie API
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `
    INSERT INTO
      movie (director_id, movie_name, lead_actor)
    VALUES (
      ${directorId},
      '${movieName}',
      '${leadActor}'
    );`
  await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//Get movie API
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT 
    *
  FROM
    movie
  WHERE
    movie_id = ${movieId};`
  const movie = await db.get(getMovieQuery)
  response.send(convertDbObjectToResponseObject(movie))
})

//Update movie API
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `
  UPDATE 
    movie
  SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}';`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//Delete movie API
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

const convertDbObjectToResponseObjectDirector = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

//Get list of all directors API
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
  SELECT
    *
  FROM
    director;`
  const directorArray = await db.all(getDirectorsQuery)
  response.send(
    directorArray.map(eachDitrector =>
      convertDbObjectToResponseObjectDirector(eachDitrector),
    ),
  )
})

//Get list of specific director movie names API
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMovieNameQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id = ${directorId};`
  const movieNameArray = await db.all(getMovieNameQuery)
  response.send(
    movieNameArray.map(each => convertDbObjectToResponseObject(each)),
  )
})

module.exports = app
