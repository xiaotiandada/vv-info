import React from 'react';

const color = ({negative, neutral}: { negative: boolean; neutral: boolean }) => {
	console.log('neutral', neutral);
	return negative ? 'text-red-500' : 'text-green-500';
};

export interface LogoProps {
  value: number | undefined
  decimals?: number
  fontSize?: string
  fontWeight?: number
  wrap?: boolean
  simple?: boolean
}

export default function Percent({
	value,
	decimals = 2,
	wrap = false,
	simple = false,
	...rest
}: LogoProps) {
	if (value === undefined || value === null) {
		return (
			<span className="font-normal">
        -
			</span>
		);
	}

	const truncated = parseFloat(value.toFixed(decimals));

	if (simple) {
		return (
			<span className={`font-normal text-base ${color({negative: false, neutral: true})}`}>
				{Math.abs(value).toFixed(decimals)}%
			</span>
		);
	}

	return (
		<span {...rest} className={`font-normal text-base ${color({negative: truncated < 0, neutral: truncated === 0})}`}>
			{wrap && '('}
			{truncated < 0 && '↓'}
			{truncated > 0 && '↑'}
			{Math.abs(value).toFixed(decimals)}%{wrap && ')'}
		</span>
	);
}
