import movies from '../data/movies.json'

type Movie = {
  id: string | number
  title: string
  watched?: boolean
}

export default function fetchMovies(): Movie[] {
  return movies as unknown as Movie[]
}
