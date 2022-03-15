import React, {useState} from 'react';
import styled from 'styled-components';
import {isAddress} from '../../utils/index';
import EthereumLogo from '../../assets/images/ethereum-logo.png';
import {HelpCircle} from 'react-feather';

export const getTokenLogoURL = (address: string) => `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({size}) => size};
  height: ${({size}) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`;

export default function CurrencyLogo({
	address,
	size = '24px',
	style,
	...rest
}: {
  address: string
  size?: string
  style?: React.CSSProperties
}) {
	const checkSummed = isAddress(address);
	const [isBed, setIsBed] = useState<boolean>(false);

	if (!checkSummed || address === '0x4200000000000000000000000000000000000006') {
		return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} {...rest} />;
	}

	return (
		<div className="avatar">
			<div className="w-6 rounded-full">
				{
					isBed
						? <HelpCircle />
						: <img src={getTokenLogoURL(checkSummed)} alt={'token logo'} onError={({currentTarget}) => {
							console.log('currentTarget', currentTarget);
							setIsBed(true);
						}} />
				}
			</div>
		</div>
	);
}
