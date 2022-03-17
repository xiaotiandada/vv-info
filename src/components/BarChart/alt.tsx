import React, {Dispatch, SetStateAction, ReactNode} from 'react';
import {BarChart, ResponsiveContainer, XAxis, Tooltip, Bar} from 'recharts';
import styled from 'styled-components';
import Card from '../Card';
import {RowBetween} from '../Row';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {VolumeWindow} from '../../types';
dayjs.extend(utc);

const DEFAULT_HEIGHT = 300;

const Wrapper = styled(Card)`
  width: 100%;
  height: ${DEFAULT_HEIGHT}px;
  padding: 1rem;
  padding-right: 2rem;
  display: flex;
  background-color: ${({theme}) => theme.bg0};
  flex-direction: column;
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
  activeWindow?: VolumeWindow
  topLeft?: ReactNode | undefined
  topRight?: ReactNode | undefined
  bottomLeft?: ReactNode | undefined
  bottomRight?: ReactNode | undefined
} & React.HTMLAttributes<HTMLDivElement>

const CustomBar = ({
	x,
	y,
	width,
	height,
	fill,
}: {
  x: number
  y: number
  width: number
  height: number
  fill: string
}) => (
	<g>
		<rect x={x} y={y} fill={fill} width={width} height={height} rx="2" />
	</g>
);

const Chart = ({
	data,
	color = '#56B2A4',
	setValue,
	setLabel,
	value,
	label,
	activeWindow,
	topLeft,
	topRight,
	bottomLeft,
	bottomRight,
	minHeight = DEFAULT_HEIGHT,
	...rest
}: LineChartProps) => {
	const parsedValue = value;

	const now = dayjs();

	return (
		<Wrapper minHeight={minHeight} {...rest}>
			<RowBetween style={{alignItems: 'flex-start'}}>
				{topLeft ?? null}
				{topRight ?? null}
			</RowBetween>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					width={500}
					height={300}
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
					<XAxis
						dataKey="time"
						axisLine={false}
						tickLine={false}
						tickFormatter={time => dayjs(time).format(activeWindow === VolumeWindow.monthly ? 'MMM' : 'DD')}
						minTickGap={10}
					/>
					<Tooltip
						cursor={{fill: '#2C2F36'}}
						contentStyle={{display: 'none'}}
						formatter={(value: number, name: string, props: { payload: { time: string; value: number } }) => {
							// eslint-disable-next-line react/prop-types
							if (setValue && parsedValue !== props.payload.value) {
							// eslint-disable-next-line react/prop-types
								setValue(props.payload.value);
							}

							// eslint-disable-next-line react/prop-types
							const formattedTime = dayjs(props.payload.time).format('MMM D');
							// eslint-disable-next-line react/prop-types
							const formattedTimeDaily = dayjs(props.payload.time).format('MMM D YYYY');
							// eslint-disable-next-line react/prop-types
							const formattedTimePlusWeek = dayjs(props.payload.time).add(1, 'week');
							// eslint-disable-next-line react/prop-types
							const formattedTimePlusMonth = dayjs(props.payload.time).add(1, 'month');

							if (setLabel && label !== formattedTime) {
								if (activeWindow === VolumeWindow.weekly) {
									const isCurrent = formattedTimePlusWeek.isAfter(now);
									setLabel(formattedTime + '-' + (isCurrent ? 'current' : formattedTimePlusWeek.format('MMM D, YYYY')));
								} else if (activeWindow === VolumeWindow.monthly) {
									const isCurrent = formattedTimePlusMonth.isAfter(now);
									setLabel(formattedTime + '-' + (isCurrent ? 'current' : formattedTimePlusMonth.format('MMM D, YYYY')));
								} else {
									setLabel(formattedTimeDaily);
								}
							}
						}}
					/>
					<Bar
						dataKey="value"
						fill={color}
						// eslint-disable-next-line react/prop-types
						shape={props => <CustomBar height={props.height} width={props.width} x={props.x} y={props.y} fill={color} />}
					/>
				</BarChart>
			</ResponsiveContainer>
			<RowBetween>
				{bottomLeft ?? null}
				{bottomRight ?? null}
			</RowBetween>
		</Wrapper>
	);
};

export default Chart;
