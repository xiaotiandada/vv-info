import React, {useMemo, useState} from 'react';
import TokenTable from './components/tokens/TokenTable';
import {useTopTokenAddresses} from './data/tokens/topTokens';
import {TokenData, useFetchedTokenDatas} from './data/tokens/tokenData';
import {getEtherscanLink, notEmpty, shortenAddress} from './utils';
import {TOKEN_HIDE} from './constants';
import LineChart from './components/LineChart/alt';
import BarChart from './components/BarChart/alt';
import {EthereumNetworkInfo, PolygonNetworkInfo} from './constants/networks';
import {formatDollarAmount} from './utils/numbers';
import {useFetchGlobalChartData} from './data/protocol/chart';
import {unixToDate} from './utils/date';
import {VolumeWindow} from './types';
import TopTokenMovers from './components/tokens/TopTokenMovers';
import {useTokenData} from './data/tokens/hooks';
import CurrencyLogo from './components/CurrencyLogo';
import {networkPrefix} from './utils/networkPrefix';
import Percent from './components/Percent';
import CandleChart from './components/CandleChart';
import {data as CandleChartData} from './components/CandleChart/data';
import dayjs from 'dayjs';

// eslint-disable-next-line no-unused-vars
enum ChartView {
	// eslint-disable-next-line no-unused-vars
	TVL,
	// eslint-disable-next-line no-unused-vars
	VOL,
	// eslint-disable-next-line no-unused-vars
	PRICE,
}

function UniswapOverview() {
	const [volumeHover, setVolumeHover] = useState<number | undefined>();

	const [liquidityHover, setLiquidityHover] = useState<number | undefined>();
	const [leftLabel, setLeftLabel] = useState<string | undefined>();

	const [rightLabel, setRightLabel] = useState<string | undefined>();

	const {data: chartData} = useFetchGlobalChartData();

	const formattedTvlData = useMemo(() => {
		if (chartData) {
			return chartData.map(day => ({
				time: unixToDate(day.date),
				value: day.tvlUSD,
			}));
		}

		return [];
	}, [chartData]);

	console.log('formattedTvlData', formattedTvlData);

	const formattedVolumeData = useMemo(() => {
		if (chartData) {
			return chartData.map(day => ({
				time: unixToDate(day.date),
				value: day.volumeUSD,
			}));
		}

		return [];
	}, [chartData]);

	const weeklyVolumeData = formattedVolumeData;
	const monthlyVolumeData = formattedVolumeData;

	const [volumeWindow, setVolumeWindow] = useState(VolumeWindow.daily);

	return (
		<>
			<h3 className="font-bold">Uniswap Overview</h3>
			<div className="flex">
				<div className="w-[588px] h-[332px] bg-[#191B1F] rounded-[16px]">
					<LineChart
						data={formattedTvlData}
						height={220}
						minHeight={332}
						color={EthereumNetworkInfo.primaryColor}
						value={liquidityHover}
						label={leftLabel}
						setValue={setLiquidityHover}
						setLabel={setLeftLabel}
						topLeft={
							<div>
								<span>TVL</span>
								<div>
									<span className="tabular-nums">{formatDollarAmount(liquidityHover, 2, true)} </span>
								</div>
								<div>
									{leftLabel ? <span className="tabular-nums">{leftLabel} (UTC)</span> : null}
								</div>
							</div>
						}
					/>
				</div>
				<div className="w-[588px] h-[332px] bg-[#191B1F] rounded-[16px]">
					<BarChart
						height={220}
						minHeight={332}
						data={
							volumeWindow === VolumeWindow.monthly
								? monthlyVolumeData
								: volumeWindow === VolumeWindow.weekly
									? weeklyVolumeData
									: formattedVolumeData
						}
						color={'#2172E5'}
						setValue={setVolumeHover}
						setLabel={setRightLabel}
						value={volumeHover}
						label={rightLabel}
						activeWindow={volumeWindow}
						topRight={
							<div style={{marginLeft: '-40px', marginTop: '8px'}}>
								<button
									// Active={volumeWindow === VolumeWindow.daily}
									onClick={() => setVolumeWindow(VolumeWindow.daily)}
								>
									D
								</button>
								<button
									// Active={volumeWindow === VolumeWindow.weekly}
									style={{marginLeft: '8px'}}
									onClick={() => setVolumeWindow(VolumeWindow.weekly)}
								>
									W
								</button>
								<button
									// Active={volumeWindow === VolumeWindow.monthly}
									style={{marginLeft: '8px'}}
									onClick={() => setVolumeWindow(VolumeWindow.monthly)}
								>
									M
								</button>
							</div>
						}
						topLeft={
							<div>
								<span>Volume 24H</span>
								<span>
									<span className="tabular-nums"> {formatDollarAmount(volumeHover, 2)}</span>
								</span>
								<span>
									{rightLabel ? <span className="tabular-nums">{rightLabel} (UTC)</span> : null}
								</span>
							</div>
						}
					/>
				</div>
			</div>
		</>
	);
}

function TopTokens() {
	const {addresses: allTokenData} = useTopTokenAddresses();
	const {data: allTokens} = useFetchedTokenDatas(allTokenData || []);
	// Console.log('allTokens', allTokens);

	const formattedTokens = useMemo(() => Object.values(allTokens || {})
		.map(t => t)
		.filter(notEmpty)
		.filter(t => !TOKEN_HIDE.includes(t.address)), [allTokens]);

	return (
		<>
			<h3 className="font-bold">Top Tokens</h3>
			<TokenTable tokenDatas={formattedTokens} />
			<TopMovers allTokens={formattedTokens} />
		</>
	);
}

function TopMovers({allTokens}: {
	allTokens: TokenData[]
}) {
	return (
		<div className="w-10/12 m-auto bg-[#191B1F] rounded-[16px] p-[12px]">
			<h3 className="font-bold">Top Movers</h3>
			<div className="mt-2">
				<TopTokenMovers allTokens={allTokens} />
			</div>
		</div>
	);
}

function TokenPage() {
	const address = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

	const {addresses: allTokenData} = useTopTokenAddresses();
	const {data: allTokens} = useFetchedTokenDatas(allTokenData || []);

	// Chart labels
	// eslint-disable-next-line no-unused-vars
	const [view, setView] = useState(ChartView.PRICE);
	// eslint-disable-next-line no-unused-vars
	const [latestValue, setLatestValue] = useState<number | undefined>();
	const [valueLabel, setValueLabel] = useState<string | undefined>();

	const tokenData = useTokenData(address, allTokens || {});
	console.log('TokenPage allTokens', allTokens);

	console.log('TokenPage tokenData', tokenData);

	if (!tokenData) {
		return <span>Loading...</span>;
	}

	return (
		<div>
			<h3 className="font-bold">Token</h3>
			<div className="mx-6 my-6">
				<div>
					<CurrencyLogo address={tokenData!.address} />
					<span className="ml-2">
						{tokenData?.name}
						<span className="ml-2 text-gray-400">({tokenData?.symbol})</span>
					</span>
				</div>

				<span>{networkPrefix(EthereumNetworkInfo)}</span>
				<br />
				<span>{networkPrefix(PolygonNetworkInfo)}</span>
				<br />
				<span>({shortenAddress(tokenData.address)})</span>
				<br />
				<a href={getEtherscanLink(1, address, 'address', EthereumNetworkInfo)}>{tokenData.address}</a>
				<br />
				<span>{formatDollarAmount(tokenData.priceUSD)}<span className="ml-2">(<Percent value={tokenData.priceUSDChange} />)</span></span>

				<div className="bg-[#191B1F] rounded-[16px] p-4 grid gap-8 my-8">

					<div>
						<div>TVL</div>
						<div>{formatDollarAmount(tokenData.tvlUSD)}</div>
						<Percent value={tokenData.tvlUSDChange} />
					</div>

					<div>
						<div>24h Trading Vol</div>
						<div>{formatDollarAmount(tokenData.volumeUSD)}</div>
						<Percent value={tokenData.volumeUSDChange} />
					</div>

					<div>
						<div>7d Trading Vol</div>
						<div>{formatDollarAmount(tokenData.volumeUSDWeek)}</div>
					</div>

					<div>
						<div>24h Fees</div>
						<div>{formatDollarAmount(tokenData.feesUSD)}</div>
					</div>

				</div>

				<div className="bg-[#191B1F] rounded-[16px] p-4 grid gap-8 my-8">
					<div>
						<span className="tabular-nums">
							{formatDollarAmount(tokenData.priceUSD, 2)}
						</span>
					</div>
					<div>
						{valueLabel ? (
							<span className="tabular-nums">{valueLabel} (UTC)</span>
						) : (
							<span className="tabular-nums">{dayjs.utc().format('MMM D, YYYY')}</span>
						)}
					</div>

					<CandleChart data={CandleChartData}
						setValue={setLatestValue}
						setLabel={setValueLabel}
					// Color={backgroundColor}
					/>
				</div>
			</div>
		</div>
	);
}

function App() {
	return (
		<div>
			<TokenPage />
			<UniswapOverview />
			<TopTokens />
		</div>
	);
}

export default App;
