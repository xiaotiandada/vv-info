import {client} from '../../apollo/client';
import {useQuery} from '@apollo/client';
import gql from 'graphql-tag';
import {formatTokenName, formatTokenSymbol} from '../../utils/tokens';
import {EthereumNetworkInfo} from '../../constants/networks';
import {useEthPrices} from '../../hooks/useEthPrices';
import {useBlocksFromTimestamps} from '../../hooks/useBlocksFromTimestamps';
import {useDeltaTimestamps} from '../../utils/queries';
import {get2DayChange, getPercentChange} from '../../utils/data';

export const TOKENS_BULK = (block: number | undefined, tokens: string[]) => {
	let tokenString = '[';
	// eslint-disable-next-line no-return-assign
	tokens.map(address => (tokenString += `"${address}",`));
	tokenString += ']';
	const queryString
		= `
    query tokens {
      tokens(where: {id_in: ${tokenString}},`
		+ (block ? `block: {number: ${block}} ,` : '')
		+ ` orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
        id
        symbol
        name
        derivedETH
        volumeUSD
        volume
        txCount
        totalValueLocked
        feesUSD
        totalValueLockedUSD
      }
    }
    `;
	return gql(queryString);
};

interface TokenFields {
	id: string
	symbol: string
	name: string
	derivedETH: string
	volumeUSD: string
	volume: string
	feesUSD: string
	txCount: string
	totalValueLocked: string
	totalValueLockedUSD: string
}

interface TokenDataResponse {
	tokens: TokenFields[]
	bundles: {
		ethPriceUSD: string
	}[]
}

export type TokenData = {
	// Token is in some pool on uniswap
	exists: boolean

	// Basic token info
	name: string
	symbol: string
	address: string

	// Volume
	volumeUSD: number
	volumeUSDChange: number
	volumeUSDWeek: number
	txCount: number

	// Fees
	feesUSD: number

	// Tvl
	tvlToken: number
	tvlUSD: number
	tvlUSDChange: number

	priceUSD: number
	priceUSDChange: number
	priceUSDChangeWeek: number
}

/**
 * Fetch top addresses by volume
 */
export function useFetchedTokenDatas(tokenAddresses: string[]) {
	console.log('tokenAddresses', tokenAddresses);

	const activeNetwork = EthereumNetworkInfo;

	// Get blocks from historic timestamps
	const [t24, t48, tWeek] = useDeltaTimestamps();
	const {blocks, error: blockError} = useBlocksFromTimestamps([t24, t48, tWeek]);
	const [block24, block48, blockWeek] = blocks ?? [];
	const ethPrices = useEthPrices();

	console.log('ethPrices', ethPrices);

	// eslint-disable-next-line new-cap
	const {loading, error, data} = useQuery<TokenDataResponse>(TOKENS_BULK(undefined, tokenAddresses), {
		client,
	});

	console.log('useFetchedTokenDatas data', loading, error, data);

	// eslint-disable-next-line radix, new-cap
	const {loading: loading24, error: error24, data: data24} = useQuery<TokenDataResponse>(TOKENS_BULK(parseInt(block24?.number), tokenAddresses), {
		client,
	});
	// eslint-disable-next-line radix, new-cap
	const {loading: loading48, error: error48, data: data48} = useQuery<TokenDataResponse>(TOKENS_BULK(parseInt(block48?.number), tokenAddresses), {
		client,
	});
	// eslint-disable-next-line radix, new-cap
	const {loading: loadingWeek, error: errorWeek, data: dataWeek} = useQuery<TokenDataResponse>(TOKENS_BULK(parseInt(blockWeek?.number), tokenAddresses), {
		client,
	});

	const anyError = Boolean(error || error24 || error48 || blockError || errorWeek);
	const anyLoading = Boolean(loading || loading24 || loading48 || loadingWeek || !blocks);

	if (!ethPrices) {
		return {
			loading: true,
			error: false,
			data: undefined,
		};
	}

	// @ts-ignore
	const parsed = data?.tokens
		? data.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
			accum[poolData.id] = poolData;
			return accum;
		}, {})
		: {};
	// @ts-ignore
	const parsed24 = data24?.tokens
		? data24.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
			accum[poolData.id] = poolData;
			return accum;
		}, {})
		: {};
	const parsed48 = data48?.tokens
		? data48.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
			accum[poolData.id] = poolData;
			return accum;
		}, {})
		: {};
	const parsedWeek = dataWeek?.tokens
		? dataWeek.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
			accum[poolData.id] = poolData;
			return accum;
		}, {})
		: {};

	console.log('parsed', parsed);

	// Format data and calculate daily changes
	// eslint-disable-next-line complexity
	const formatted = tokenAddresses.reduce((accum: { [address: string]: TokenData }, address) => {
		const current: TokenFields | undefined = parsed[address];
		const oneDay: TokenFields | undefined = parsed24[address];
		const twoDay: TokenFields | undefined = parsed48[address];
		const week: TokenFields | undefined = parsedWeek[address];

		console.log('current', current);

		const [volumeUSD, volumeUSDChange] = current && oneDay && twoDay
			? get2DayChange(current.volumeUSD, oneDay.volumeUSD, twoDay.volumeUSD)
			: current
				? [parseFloat(current.volumeUSD), 0]
				: [0, 0];

		const volumeUSDWeek = current && week
			? parseFloat(current.volumeUSD) - parseFloat(week.volumeUSD)
			: current
				? parseFloat(current.volumeUSD)
				: 0;

		const tvlUSD = current ? parseFloat(current.totalValueLockedUSD) : 0;
		const tvlUSDChange = getPercentChange(current?.totalValueLockedUSD, oneDay?.totalValueLockedUSD);
		const tvlToken = current ? parseFloat(current.totalValueLocked) : 0;
		const priceUSD = current ? parseFloat(current.derivedETH) * ethPrices.current : 0;
		const priceUSDOneDay = oneDay ? parseFloat(oneDay.derivedETH) * ethPrices.oneDay : 0;
		const priceUSDWeek = week ? parseFloat(week.derivedETH) * ethPrices.week : 0;
		const priceUSDChange = priceUSD && priceUSDOneDay ? getPercentChange(priceUSD.toString(), priceUSDOneDay.toString()) : 0;

		const priceUSDChangeWeek = priceUSD && priceUSDWeek ? getPercentChange(priceUSD.toString(), priceUSDWeek.toString()) : 0;
		const txCount = current && oneDay
			? parseFloat(current.txCount) - parseFloat(oneDay.txCount)
			: current
				? parseFloat(current.txCount)
				: 0;
		const feesUSD = current && oneDay
			? parseFloat(current.feesUSD) - parseFloat(oneDay.feesUSD)
			: current
				? parseFloat(current.feesUSD)
				: 0;

		accum[address] = {
			exists: Boolean(current),
			address,
			name: current ? formatTokenName(address, current.name, activeNetwork) : '',
			symbol: current ? formatTokenSymbol(address, current.symbol, activeNetwork) : '',
			volumeUSD,
			volumeUSDChange,
			volumeUSDWeek,
			txCount,
			tvlUSD,
			feesUSD,
			tvlUSDChange,
			tvlToken,
			priceUSD,
			priceUSDChange,
			priceUSDChangeWeek,
		};

		return accum;
	}, {});

	return {
		loading: anyLoading,
		error: anyError,
		data: formatted,
	};
}
