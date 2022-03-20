import {getAddress} from '@ethersproject/address';
import {SupportedChainId} from '../constants/chains';
import {NetworkInfo, PolygonNetworkInfo, ArbitrumNetworkInfo, OptimismNetworkInfo} from '../constants/networks';

export function isAddress(value: any): string | false {
	try {
		return getAddress(value);
	} catch {
		return false;
	}
}

const ETHERSCAN_PREFIXES: { [chainId: number]: string } = {
	[SupportedChainId.MAINNET]: '',
	[SupportedChainId.ROPSTEN]: 'ropsten.',
	[SupportedChainId.RINKEBY]: 'rinkeby.',
	[SupportedChainId.GOERLI]: 'goerli.',
	[SupportedChainId.KOVAN]: 'kovan.',
	[SupportedChainId.OPTIMISM]: 'optimistic.',
	[SupportedChainId.OPTIMISTIC_KOVAN]: 'kovan-optimistic.',
};

export function getEtherscanLink(
	chainId: number,
	data: string,
	type: 'transaction' | 'token' | 'address' | 'block',
	networkVersion: NetworkInfo,
): string {
	const prefix = networkVersion === PolygonNetworkInfo
		? 'https://polygonscan.com/'
		: networkVersion === ArbitrumNetworkInfo
			? 'https://arbiscan.io/'
			: networkVersion === OptimismNetworkInfo
				? 'https://optimistic.etherscan.io'
				: `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}etherscan.io`;

	if (networkVersion === OptimismNetworkInfo) {
		switch (type) {
			case 'transaction': {
				return `${prefix}/tx/${data}`;
			}

			case 'token': {
				return `${prefix}/address/${data}`;
			}

			case 'block': {
				return 'https://optimistic.etherscan.io';
			}

			case 'address':
			default: {
				return `${prefix}/address/${data}`;
			}
		}
	}

	if (networkVersion === ArbitrumNetworkInfo) {
		switch (type) {
			case 'transaction': {
				return `${prefix}/tx/${data}`;
			}

			case 'token': {
				return `${prefix}/address/${data}`;
			}

			case 'block': {
				return 'https://arbiscan.io/';
			}

			case 'address':
			default: {
				return `${prefix}/address/${data}`;
			}
		}
	}

	switch (type) {
		case 'transaction': {
			return `${prefix}/tx/${data}`;
		}

		case 'token': {
			return `${prefix}/token/${data}`;
		}

		case 'block': {
			return `${prefix}/block/${data}`;
		}

		case 'address':
		default: {
			return `${prefix}/address/${data}`;
		}
	}
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
	return value !== null && value !== undefined;
}

// Shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
	const parsed = isAddress(address);
	if (!parsed) {
		throw Error(`Invalid 'address' parameter '${address}'.`);
	}

	return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

export const currentTimestamp = () => new Date().getTime();
