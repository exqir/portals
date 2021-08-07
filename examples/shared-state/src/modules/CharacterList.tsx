import type { IOnInitHook } from '@portals/react'
import React from 'react'
import { useQuery, gql } from '@apollo/client'

import { useAppState } from '../provider/AppStateProvider'
import { ModuleBox } from '../components/ModuleBox'

const GET_CHARACTERS = gql`
  query getCharacters($episode: ID!) {
    episode(id: $episode) {
      episode
      characters {
        id
        name
        image
      }
    }
  }
`

interface EpisodeCharacters {
  characters: {
    id: string
    image: string
    name: string
  }[]
}

export const useInit: IOnInitHook<EpisodeCharacters> = () => {
  const {
    state: { episode: episodeId },
  } = useAppState()
  const {
    data: { episode } = {
      episode: { characters: [] },
    },
    loading,
    error,
  } = useQuery(GET_CHARACTERS, {
    variables: { episode: episodeId },
    skip: !episodeId,
  })

  return { loading, error, data: episode }
}

interface CharacterListProps {
  data: EpisodeCharacters
}

// This "module" is responsible for showing the characters that
// appear in a specific episode the user has chosen.
export default function CharacterList({ data: episode }: CharacterListProps) {
  const {
    state: { episode: episodeId },
  } = useAppState()

  if (!episodeId)
    return <ModuleBox>You have to choose an episode first!'</ModuleBox>

  return (
    <ModuleBox>
      <section className="characters">
        <h2>Characters:</h2>
        <div>
          {episode.characters.map(character => (
            <article key={character.id}>
              <img
                src={character.image}
                alt={character.name}
                width="150"
                height="150"
              />
              {character.name}
            </article>
          ))}
        </div>
      </section>
    </ModuleBox>
  )
}
