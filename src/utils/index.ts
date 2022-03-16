import {getAddress} from '@ethersproject/address';

export function isAddress(value: any): string | false {
	try {
		return getAddress(value);
	} catch {
		return false;
	}
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
	return value !== null && value !== undefined;
}
