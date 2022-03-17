import React, {useMemo, useState} from 'react';
import TokenTable from './components/tokens/TokenTable';
import {useTopTokenAddresses} from './data/tokens/topTokens';
import {TokenData, useFetchedTokenDatas} from './data/tokens/tokenData';
import {notEmpty} from './utils';
import {TOKEN_HIDE} from './constants';
import LineChart from './components/LineChart/alt';
import BarChart from './components/BarChart/alt';
import {EthereumNetworkInfo} from './constants/networks';
import {formatDollarAmount} from './utils/numbers';
import {useFetchGlobalChartData} from './data/protocol/chart';
import {unixToDate} from './utils/date';
import {VolumeWindow} from './types';
import TopTokenMovers from './components/tokens/TopTokenMovers';

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
	console.log('allTokens', allTokens);

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

function App() {
	return (
		<div>
			<UniswapOverview />
			<TopTokens />
		</div>
	);
}

export default App;
