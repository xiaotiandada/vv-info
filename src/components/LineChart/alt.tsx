import React, {Dispatch, SetStateAction, ReactNode} from 'react';
import {ResponsiveContainer, XAxis, Tooltip, AreaChart, Area} from 'recharts';
import styled from 'styled-components';
import Card from '../Card';
import {RowBetween} from '../Row';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
// Import useTheme from 'hooks/useTheme'
import {darken} from 'polished';
dayjs.extend(utc);

const DEFAULT_HEIGHT = 300;

const Wrapper = styled(Card)`
  width: 100%;
  height: ${DEFAULT_HEIGHT}px;
  padding: 1rem;
  padding-right: 2rem;
  display: flex;
  background-color: '#191B1F';
  flex-direction: column;
	justify-content: flex-end;
  > * {
    font-size: 1rem;
  }
`;

export type LineChartProps = {
  data: any[]
  color?: string | undefined
  height?: number | undefined
  minHeight?: number
  setValue?: Dispatch<SetStateAction<number | undefined>> // Used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>> // Used for label of valye
  value?: number
  label?: string
  topLeft?: ReactNode | undefined
  topRight?: ReactNode | undefined
  bottomLeft?: ReactNode | undefined
  bottomRight?: ReactNode | undefined
} & React.HTMLAttributes<HTMLDivElement>

const Chart = ({
	data,
	color = '#56B2A4',
	value,
	label,
	setValue,
	setLabel,
	topLeft,
	topRight,
	bottomLeft,
	bottomRight,
	minHeight = DEFAULT_HEIGHT,
	...rest
}: LineChartProps) => {
	const parsedValue = value;

	return (
		<Wrapper minHeight={minHeight} {...rest}>
			<RowBetween>
				{topLeft ?? null}
				{topRight ?? null}
			</RowBetween>
			<div className="w-[540px] h-[220px]">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						width={500}
						height={220}
						data={data}
						margin={{
							top: 5,
							right: 30,
							left: 20,
							bottom: 5,
						}}
						onMouseLeave={() => {
						// eslint-disable-next-line no-unused-expressions
							setLabel && setLabel(undefined);
							// eslint-disable-next-line no-unused-expressions
							setValue && setValue(undefined);
						}}
					>
						<defs>
							<linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={darken(0.36, color)} stopOpacity={0.5} />
								<stop offset="100%" stopColor={color} stopOpacity={0} />
							</linearGradient>
						</defs>
						<XAxis
							dataKey="time"
							axisLine={false}
							tickLine={false}
							tickFormatter={time => dayjs(time).format('DD')}
							minTickGap={10}
						/>
						<Tooltip
							cursor={{stroke: '#2C2F36'}}
							contentStyle={{display: 'none'}}
							formatter={(value: number, name: string, props: { payload: { time: string; value: number } }) => {
							// eslint-disable-next-line react/prop-types
								if (setValue && parsedValue !== props.payload.value) {
									// eslint-disable-next-line react/prop-types
									setValue(props.payload.value);
								}

								// eslint-disable-next-line react/prop-types
								const formattedTime = dayjs(props.payload.time).format('MMM D, YYYY');
								if (setLabel && label !== formattedTime) {
									setLabel(formattedTime);
								}
							}}
						/>
						<Area dataKey="value" type="monotone" stroke={color} fill="url(#gradient)" strokeWidth={2} />
					</AreaChart>
				</ResponsiveContainer>
			</div>
			<RowBetween>
				{bottomLeft ?? null}
				{bottomRight ?? null}
			</RowBetween>
		</Wrapper>
	);
};

export default Chart;
