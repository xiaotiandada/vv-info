import {useMemo} from 'react';
import {useQuery} from '@apollo/client';
import gql from 'graphql-tag';
import {client} from '../../apollo/client';

export const TOP_TOKENS = gql`
  query topPools {
    tokens(first: 50, orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
      id
    }
  }
`;

interface TopTokensResponse {
  tokens: {
    id: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useTopTokenAddresses(): {
  loading: boolean
  error: boolean
  addresses: string[] | undefined
  } {
	const {loading, error, data} = useQuery<TopTokensResponse>(TOP_TOKENS, {client});

	console.log('data', data);

	const formattedData = useMemo(() => {
		if (data) {
			return data.tokens.map(t => t.id);
		}

		return undefined;
	}, [data]);

	return {
		loading,
		error: Boolean(error),
		addresses: formattedData,
	};
}
