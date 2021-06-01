import type { IOnInitHook } from '@portals/core'
import React from 'react'
import { useQuery, gql } from '@apollo/client'

import { useAppState } from '../provider/AppStateProvider'
import { ModuleBox } from '../components/ModuleBox'

const GET_EPISODES = gql`
  query getEpisodes($season: String!) {
    episodes(page: 1, filter: { episode: $season }) {
      results {
        id
        name
        episode
      }
    }
  }
`

interface Episode {
  episode: string, id: string, name: string
}

export const useInit: IOnInitHook<Episode[]> = () => {
  const { state } = useAppState()
  const { season } = state
  const {
    data: { episodes: { results: episodes } } = { episodes: { results: [] } },
    loading,
    error,
  } = useQuery(GET_EPISODES, {
    variables: { season },
    skip: !season,
  })

  return { loading, error, data: episodes }
}

interface EpisodeSelectionProps {
  data: Episode[] 
}

export default function EpisodeSelection({ data: episodes }: EpisodeSelectionProps) {
  const { state, setState } = useAppState()
  const { season, episode: selectedEpisode } = state

  if (!season) return <ModuleBox>You have to choose a season first!</ModuleBox>

  return (
    <ModuleBox>
      <section className="episodes">
        <h2>Episodes:</h2>
        <ul>
          {episodes.map(episode => (
            <li key={episode.episode}>
              <input
                id={`episode-${episode.id}`}
                type="radio"
                name="selected-episode"
                value={episode.id}
                onChange={() => setState({ ...state, episode: episode.id })}
                checked={episode.id === selectedEpisode}
              />
              <label htmlFor={`episode-${episode.id}`}>
                {episode.episode}: {episode.name}
              </label>
            </li>
          ))}
        </ul>
      </section>
    </ModuleBox>
  )
}
