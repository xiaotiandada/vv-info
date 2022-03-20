import {ApolloClient, NormalizedCacheObject} from '@apollo/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import gql from 'graphql-tag';

// Format dayjs with the libraries that we need
dayjs.extend(utc);
dayjs.extend(weekOfYear);
const ONE_DAY_UNIX = 24 * 60 * 60;

const TOKEN_CHART = gql`
  query tokenDayDatas($startTime: Int!, $skip: Int!, $address: Bytes!) {
    tokenDayDatas(
      first: 1000
      skip: $skip
      where: { token: $address, date_gt: $startTime }
      orderBy: date
      orderDirection: asc
      subgraphError: allow
    ) {
      date
      volumeUSD
      totalValueLockedUSD
    }
  }
`;

export interface TokenChartEntry {
  date: number
  volumeUSD: number
  totalValueLockedUSD: number
}

interface ChartResults {
  tokenDayDatas: {
    date: number
    volumeUSD: string
    totalValueLockedUSD: string
  }[]
}

export async function fetchTokenChartData(address: string, client: ApolloClient<NormalizedCacheObject>) {
	let data: {
    date: number
    volumeUSD: string
    totalValueLockedUSD: string
  }[] = [];
	const startTimestamp = 1619170975;
	const endTimestamp = dayjs.utc().unix();

	let error = false;
	let skip = 0;
	let allFound = false;

	try {
		while (!allFound) {
			// eslint-disable-next-line no-await-in-loop
			const {data: chartResData, error, loading} = await client.query<ChartResults>({
				query: TOKEN_CHART,
				variables: {
					address,
					startTime: startTimestamp,
					skip,
				},
				fetchPolicy: 'cache-first',
			});
			if (!loading) {
				skip += 1000;
				if (chartResData.tokenDayDatas.length < 1000 || error) {
					allFound = true;
				}

				if (chartResData) {
					data = data.concat(chartResData.tokenDayDatas);
				}
			}
		}
	} catch {
		error = true;
	}

	if (data) {
		const formattedExisting = data.reduce((accum: { [date: number]: TokenChartEntry }, dayData) => {
			// eslint-disable-next-line radix
			const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0));
			accum[roundedDate] = {
				date: dayData.date,
				volumeUSD: parseFloat(dayData.volumeUSD),
				totalValueLockedUSD: parseFloat(dayData.totalValueLockedUSD),
			};
			return accum;
		}, {});

		// eslint-disable-next-line radix
		const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])];

		// Fill in empty days ( there will be no day datas if no trades made that day )
		let timestamp = firstEntry?.date ?? startTimestamp;
		let latestTvl = firstEntry?.totalValueLockedUSD ?? 0;
		while (timestamp < endTimestamp - ONE_DAY_UNIX) {
			const nextDay = timestamp + ONE_DAY_UNIX;
			// eslint-disable-next-line radix
			const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0));
			// eslint-disable-next-line no-negated-condition
			if (!Object.keys(formattedExisting).includes(currentDayIndex.toString())) {
				formattedExisting[currentDayIndex] = {
					date: nextDay,
					volumeUSD: 0,
					totalValueLockedUSD: latestTvl,
				};
			} else {
				latestTvl = formattedExisting[currentDayIndex].totalValueLockedUSD;
			}

			timestamp = nextDay;
		}

		// eslint-disable-next-line radix
		const dateMap = Object.keys(formattedExisting).map(key => formattedExisting[parseInt(key)]);

		return {
			data: dateMap,
			error: false,
		};
	}

	return {
		data: undefined,
		error,
	};
}
