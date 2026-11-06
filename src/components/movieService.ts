import movies from '../data/movies.json'

export type Movie = {
  id: string | number
  title: string
  watched?: boolean
  sequels?: Movie[]
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

export default function fetchMovies(): Movie[] {
  return movies as unknown as Movie[]
}
