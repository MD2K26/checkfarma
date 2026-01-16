import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from './Card';

interface EvolutionChartProps {
    data: { date: string; score: number }[];
}

const EvolutionChart: React.FC<EvolutionChartProps> = ({ data }) => {
    return (
        <Card className="p-4 bg-white mb-8 h-[300px]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Evolução do Score Médio</h3>
            <ResponsiveContainer width="100%" height="80%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        hide
                    />
                    <YAxis
                        domain={[0, 100]}
                        fontSize={10}
                        tickFormatter={(val) => `${val}%`}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value: any) => [`${value}%`, 'Score']}
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#1a468e"
                        strokeWidth={4}
                        dot={{ fill: '#1a468e', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default EvolutionChart;
