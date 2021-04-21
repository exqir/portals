import type { ReactNode } from 'react'
import React from 'react'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'

// The API offers a GraphQL playground for the endpoint so we
// can have a look at https://rickandmortyapi.com/graphql to
// see the schema and test our queries if necessary.
const GRAHQL_ENDPOINT = 'https://rickandmortyapi.com/graphql'

const client = new ApolloClient({
  uri: GRAHQL_ENDPOINT,
  cache: new InMemoryCache(),
})

interface IGraphQLProvderProps {
  children: ReactNode
}

export function GraphQLProvider({ children }: IGraphQLProvderProps) {

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}