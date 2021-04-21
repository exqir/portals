import React from 'react'

import { useAppState } from '../provider/AppStateProvider'
import { ModuleBox } from '../components/ModuleBox'

export default function SeasonSelector() {
  const { state, setState } = useAppState()
  return (
    <ModuleBox>
      <section className="season">
        <label htmlFor="season">
          Season:
          <select
            id="season"
            value={state.season ?? undefined}
            onChange={event => {
              setState({
                ...state,
                // @ts-ignore
                season: event.target.value,
                episode: null,
              })
            }}
          >
            <option value="S01">1</option>
            <option value="S02">2</option>
            <option value="S03">3</option>
            <option value="S04">4</option>
          </select>
        </label>
      </section>
    </ModuleBox>
  )
}
