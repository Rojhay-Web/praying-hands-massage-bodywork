import { createContext, useEffect, useMemo } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { GQL_URL } from '../utils';

const ApolloContext = createContext(null);

function Provider({ children }: { children: any }) {
    const httpLink = createHttpLink({ uri: GQL_URL });
    let authLink = setContext(async (_, { headers }) => {
            return {
                headers: { ...headers }
            }
        }), 
        client = useMemo(() => new ApolloClient({
            link: authLink.concat(httpLink), cache: new InMemoryCache(),
        }),[authLink, httpLink]);
    
    useEffect(()=>{ client.resetStore(); },[client]);

    return <ApolloContext.Provider value={null}>
            <ApolloProvider client={client}>{children}</ApolloProvider>
        </ApolloContext.Provider>;
}

const contextRet = { ApolloContext, Provider };
export default contextRet;