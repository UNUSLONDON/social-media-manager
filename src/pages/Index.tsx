
import { useState } from "react";
import { useStats } from "@/hooks/useStats";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import GaugeChart from "@/components/GaugeChart";
import TrendingSection from "@/components/TrendingSection";
import ProjectsTable from "@/components/ProjectsTable";
import FearGreedIndex from "@/components/FearGreedIndex";
import { Bitcoin, DollarSign, BarChart, LineChart } from "lucide-react";

export default function Index() {
  const { 
    loading, 
    stats, 
    tvlData, 
    fearGreed, 
    trending, 
    recentProjects, 
    refreshData 
  } = useStats();
  
  // Format large numbers for display
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${value.toFixed(2)}`;
  };
  
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onRefresh={refreshData} isLoading={loading} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-screen-2xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatsCard 
                title="Market Cap" 
                value={formatCurrency(stats.marketCap)} 
                change={stats.dailyChange} 
                icon={<BarChart size={20} className="text-chart-blue" />}
                colorClass="from-blue-500/20 to-blue-600/5"
                animationDelay="0ms"
              />
              
              <StatsCard 
                title="Bitcoin Price" 
                value={formatCurrency(stats.bitcoinPrice)} 
                change={4.2} 
                icon={<Bitcoin size={20} className="text-chart-yellow" />}
                colorClass="from-yellow-500/20 to-yellow-600/5"
                animationDelay="50ms"
              />
              
              <StatsCard 
                title="Total Value Locked" 
                value={formatCurrency(stats.totalValueLocked)} 
                change={10.2} 
                icon={<DollarSign size={20} className="text-chart-green" />}
                colorClass="from-green-500/20 to-green-600/5"
                animationDelay="100ms"
              />
              
              <StatsCard 
                title="24h Trading Volume" 
                value={formatCurrency(stats.tradingVolume)} 
                change={-2.8} 
                icon={<LineChart size={20} className="text-chart-purple" />}
                colorClass="from-purple-500/20 to-purple-600/5"
                animationDelay="150ms"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GaugeChart 
                value={tvlData.current} 
                dailyChange={tvlData.dailyChange} 
                weeklyChange={tvlData.weeklyChange} 
              />
              
              <FearGreedIndex 
                value={fearGreed.value} 
                indicator={fearGreed.indicator} 
                previousValue={fearGreed.previousValue} 
                previousChange={fearGreed.previousChange} 
              />
            </div>
            
            <TrendingSection tokens={trending} />
            
            <ProjectsTable projects={recentProjects} />
          </div>
        </main>
      </div>
    </div>
  );
}
