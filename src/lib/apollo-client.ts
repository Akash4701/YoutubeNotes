// lib/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getAuth } from "firebase/auth";

const httpLink = createHttpLink({
  uri: "/api/graphql",
});

const authLink = setContext(async (_, { headers }) => {
  const user = getAuth().currentUser;
  const token = user ? await user.getIdToken() : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
