import React, {FC} from 'react';
import {formatDollarAmount} from '../../utils/numbers';
import Percent from '../Percent';
import CurrencyLogo from '../CurrencyLogo';
import {TokenData} from '../../data/tokens/tokenData';

interface Props {
	tokenDatas: TokenData[] | undefined
}

const TokenTable: FC<Props> = ({tokenDatas}) => {
	if (!tokenDatas) {
		return <span>Loading...</span>;
	}

	return (
		<div className="overflow-x-auto w-11/12 mx-auto my-4 max-h-[400px]">
			<table className="table w-full">
				<thead>
					<tr>
						<th></th>
						<th className="capitalize">Name</th>
						<th className="capitalize">Price</th>
						<th className="capitalize">Price Change</th>
						<th className="capitalize">Volume 24H</th>
						<th className="capitalize">TVL</th>
					</tr>
				</thead>
				<tbody>
					{
						tokenDatas.map((tokenData, index) => (
							<tr key={tokenData.address}>
								<th className="text-white font-normal">{index + 1}</th>
								<td className="text-white flex items-center">
									<CurrencyLogo address={tokenData.address} />
									<span className="ml-1">{tokenData.name}</span>
									<span className="text-gray-500 ml-1">({tokenData.symbol})</span></td>
								<td className="text-white">{formatDollarAmount(tokenData.priceUSD)}</td>
								<td>
									<Percent value={tokenData.priceUSDChange}></Percent>
								</td>
								<td className="text-white">{formatDollarAmount(tokenData.volumeUSD)}</td>
								<td className="text-white">{formatDollarAmount(tokenData.tvlUSD)}</td>
							</tr>))
					}
				</tbody>
			</table>
		</div>
	);
};

export default TokenTable;
