import {useState, useEffect} from 'react';
import {isAddress} from 'ethers/lib/utils';
import {client, blockClient} from '../../apollo/client';
import {fetchTokenChartData, TokenChartEntry} from './chartData';
import {TokenData} from './tokenData';
import dayjs, {OpUnitType} from 'dayjs';
import {PriceChartEntry} from '../../types';
import {fetchTokenPriceData} from './priceData';
import {EthereumNetworkInfo} from '../../constants/networks';

export function useTokenData(address: string | undefined, allTokenData: { [address:string]: TokenData }): TokenData | undefined {
	// If invalid address return
	if (!address || !isAddress(address)) {
		return undefined;
	}

	// If token not tracked yet track it
	// @ts-ignore
	if (!allTokenData[address]) {
		return undefined;
	}

	// Return data
	// @ts-ignore
	return allTokenData[address];
}

/**
 * Get top pools addresses that token is included in
 * If not loaded, fetch and store
 * @param address
 */
export function useTokenChartData(address: string): TokenChartEntry[] | undefined {
	const [chartData, setChartData] = useState<TokenChartEntry[]>();
	// eslint-disable-next-line no-unused-vars
	const [error, setError] = useState(false);

	useEffect(() => {
		async function fetch() {
			const {error, data} = await fetchTokenChartData(address, client);
			if (!error && data) {
				setChartData(data);
			}

			if (error) {
				setError(error);
			}
		}

		fetch();
	}, []);

	// Return data
	return chartData;
}

/**
 * Get top pools addresses that token is included in
 * If not loaded, fetch and store
 * @param address
 */
export function useTokenPriceData(
	address: string,
	interval: number,
	timeWindow: OpUnitType,
): PriceChartEntry[] | undefined {
	const activeNetwork = EthereumNetworkInfo;
	const [priceData, setPriceData] = useState<PriceChartEntry[]>();
	const [error, setError] = useState(false);

	// Construct timestamps and check if we need to fetch more data
	// const oldestTimestampFetched = token.priceData.oldestFetchedTimestamp;
	const utcCurrentTime = dayjs();
	const startTimestamp = utcCurrentTime.subtract(1, timeWindow).startOf('hour').unix();

	const dataClient = client;

	useEffect(() => {
		async function fetch() {
			const {data, error: fetchingError} = await fetchTokenPriceData(
				address,
				interval,
				startTimestamp,
				dataClient,
				blockClient,
			);
			if (data) {
				setPriceData(data);
			}

			if (fetchingError) {
				setError(true);
			}
		}

		fetch();
	}, [
		activeNetwork.id,
		address,
		error,
		interval,
		// OldestTimestampFetched,
		priceData,
		startTimestamp,
		timeWindow,
	]);

	// Return data
	return priceData;
}
