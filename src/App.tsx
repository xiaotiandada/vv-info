import React, {useMemo} from 'react';
import TokenTable from './components/tokens/TokenTable';
import {useTopTokenAddresses} from './data/tokens/topTokens';
import {useFetchedTokenDatas} from './data/tokens/tokenData';
import {notEmpty} from './utils';
import {TOKEN_HIDE} from './constants';

function App() {
	const {addresses: allTokenData} = useTopTokenAddresses();
	const {data: allTokens} = useFetchedTokenDatas(allTokenData || []);
	console.log('allTokens', allTokens);

	const formattedTokens = useMemo(() => Object.values(allTokens || {})
		.map(t => t)
		.filter(notEmpty)
		.filter(t => !TOKEN_HIDE.includes(t.address)), [allTokens]);

	return (
		<div>
			<h3 className="font-bold">Top Tokens</h3>
			<TokenTable tokenDatas={formattedTokens} />
			<h3 className="font-bold">Top Pools</h3>
			{/* <TokenTable /> */}
		</div>
	);
}

export default App;
