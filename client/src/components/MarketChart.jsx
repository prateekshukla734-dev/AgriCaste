import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MarketChart = ({ marketData }) => {
  const chartData = useMemo(() => {
    if (!marketData || marketData.length === 0) return null;
    
    // Get top 10 crops by price for the chart
    const sortedData = [...marketData]
      .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
      .slice(0, 10);
    
    const maxPrice = Math.max(...sortedData.map(item => parseFloat(item.price)));
    
    return sortedData.map(item => ({
      ...item,
      percentage: (parseFloat(item.price) / maxPrice) * 100,
      changeNum: parseFloat(item.change)
    }));
  }, [marketData]);

  if (!chartData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Overview</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-600">No data available for chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Top Crops by Price</h3>
      <div className="space-y-3 sm:space-y-4">
        {chartData.map((item, index) => (
          <div key={index} className="relative">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-1">
              <span className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">{item.crop}</span>
              <div className="flex items-center justify-between sm:justify-start sm:space-x-2">
                <span className="text-sm font-semibold text-gray-900">₹{item.price}</span>
                <div className="flex items-center ml-2 sm:ml-0">
                  {item.changeNum > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : item.changeNum < 0 ? (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  ) : (
                    <Minus className="w-3 h-3 text-gray-400" />
                  )}
                  <span className={`text-xs ml-1 ${
                    item.changeNum > 0 ? 'text-green-600' : 
                    item.changeNum < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {item.changeNum > 0 ? '+' : ''}{item.change}%
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  item.changeNum > 0 ? 'bg-green-400' : 
                  item.changeNum < 0 ? 'bg-red-400' : 'bg-blue-400'
                }`}
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">{item.market}, {item.state}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketChart;