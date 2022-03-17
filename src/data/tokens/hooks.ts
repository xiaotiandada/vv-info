import {isAddress} from 'ethers/lib/utils';
import {TokenData} from './tokenData';

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
