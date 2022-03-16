import React, {FC} from 'react';
import {AreaChart, Area, XAxis, Tooltip, ResponsiveContainer} from 'recharts';
import dayjs from 'dayjs';
import {data} from './data';
import {darken} from 'polished';

export type LineChartProps = {
  data?: any[]
  color?: string | undefined
} & React.HTMLAttributes<HTMLDivElement>

const Chart: FC<LineChartProps> = ({
	color = '#56B2A4',
}) => (
	<div className="w-[500px] h-[300px] bg-[#191B1F] rounded-[16px]">
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart
				width={500}
				height={300}
				data={data}
				margin={{
					top: 5,
					right: 30,
					left: 20,
					bottom: 5,
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
				<Tooltip />
				<Area dataKey="value" type="monotone" stroke={color} fill="url(#gradient)" strokeWidth={2} />
			</AreaChart>
		</ResponsiveContainer>
	</div>
);

export default Chart;
