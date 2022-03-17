import React, {useEffect, useMemo, useRef, useState} from 'react';
import styled from 'styled-components';
import {TokenData} from '../../data/tokens/tokenData';
import {formatDollarAmount} from '../../utils/numbers';
import CurrencyLogo from '../CurrencyLogo';
import Percent from '../Percent';

export const ScrollableRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;

  ::-webkit-scrollbar {
    display: none;
  }
`;

const DataCard = ({tokenData}: { tokenData: TokenData }) => (
	<div className="min-w-[190px] mr-[16px] hover:cursor-pointer hover:opacity-60">
		<div className="bg-[#2C2F36] rounded-[16px] p-[16px] flex items-center">
			<CurrencyLogo address={tokenData.address} size={'32px'} />
			<div className="ml-2">
				<p>{tokenData.symbol}</p>
				<p>{formatDollarAmount(tokenData.priceUSD)}
					<span className="ml-2">
						<Percent value={tokenData.priceUSDChange} />
					</span>
				</p>
			</div>
		</div>
	</div>
);

export default function TopTokenMovers({allTokens}: { allTokens: TokenData[] }) {
	const topPriceIncrease = useMemo(() => allTokens
		.sort((a, b) => a && b ? (Math.abs(a?.priceUSDChange) > Math.abs(b?.priceUSDChange) ? -1 : 1) : -1)
		.slice(0, Math.min(20, allTokens.length)), [allTokens]);

	const increaseRef = useRef<HTMLDivElement>(null);
	const [increaseSet, setIncreaseSet] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line no-undef
		let timer: NodeJS.Timer;
		if (!increaseSet && increaseRef && increaseRef.current) {
			setInterval(() => {
				increaseRef.current?.scrollTo(increaseRef.current.scrollLeft + 1, 0);
			}, 30);
			setIncreaseSet(true);
		}

		return () => clearInterval(timer);
	}, [increaseRef, increaseSet]);

	return (
		<div>
			<ScrollableRow ref={increaseRef}>
				{
					topPriceIncrease.map(tokenData => (<DataCard key={tokenData.address} tokenData={tokenData}></DataCard>))
				}
			</ScrollableRow>
		</div>
	);
}
