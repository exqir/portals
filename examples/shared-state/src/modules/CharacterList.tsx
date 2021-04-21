import type { IOnInitHook } from '@portals/core'
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

export const useInit: IOnInitHook = () => {
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

// This "module" is responsible for showing the characters that
// appear in a specific episode the user has chosen.
// @ts-ignore
export default function CharacterList({ data: episode }) {
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
          {/* @ts-ignore */}
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
