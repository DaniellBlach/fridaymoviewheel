import movies from '../data/movies.json'

export default function fetchMovies() {
  return movies as Array<{ id: string; title: string }>
}
