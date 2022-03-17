import React, {useMemo, useState} from 'react';
import TokenTable from './components/tokens/TokenTable';
import {useTopTokenAddresses} from './data/tokens/topTokens';
import {useFetchedTokenDatas} from './data/tokens/tokenData';
import {notEmpty} from './utils';
import {TOKEN_HIDE} from './constants';
import LineChart from './components/LineChart/alt';
import {EthereumNetworkInfo} from './constants/networks';
import {formatDollarAmount} from './utils/numbers';
import {useFetchGlobalChartData} from './data/protocol/chart';
import {unixToDate} from './utils/date';

function UniswapOverview() {
	// eslint-disable-next-line no-unused-vars
	const [volumeHover, setVolumeHover] = useState<number | undefined>();

	const [liquidityHover, setLiquidityHover] = useState<number | undefined>();
	const [leftLabel, setLeftLabel] = useState<string | undefined>();
	// eslint-disable-next-line no-unused-vars
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
		</>
	);
}

function App() {
	return (
		<div>
			<UniswapOverview />
			<TopTokens />
			<h3 className="font-bold">Top Pools</h3>
			{/* <TokenTable /> */}
		</div>
	);
}

export default App;
