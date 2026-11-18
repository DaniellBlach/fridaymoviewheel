import movies from '../data/movies.json'

export type Movie = {
  id: string | number
  title: string
  watched?: boolean
  sequels?: Movie[]
  isSequel?: boolean
}

export function getVisibleMovies(items: Movie[]): Movie[] {
  return items.flatMap((movie) => {
   if (movie.watched === false) {
     return [movie]
   }

   if (!Array.isArray(movie.sequels) || movie.sequels.length === 0) {
     return []
   }

   const nextSequel = movie.sequels.find((sequel) => sequel.watched === false)
   return nextSequel ? [nextSequel] : []
  })
}

export function getAllMovies(items: Movie[]): Movie[] {
  return items.flatMap((movie) => [movie, ...(movie.sequels ?? [])])
}

export function getMoviesByWatchedStatus(items: Movie[], watched: boolean): Movie[] {
  return items
    .flatMap((movie) => [
      { ...movie, isSequel: false },
      ...(movie.sequels ?? []).map((sequel) => ({ ...sequel, isSequel: true }))
    ])
    .filter((movie) => movie.watched === watched)
}

export default function fetchMovies(): Movie[] {
  return movies as unknown as Movie[]
}
