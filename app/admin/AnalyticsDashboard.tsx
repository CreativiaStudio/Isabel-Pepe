'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DateRangeKey, KpiSummary, TimeSeriesPoint, FunnelData, TopPageMetric, TopProductMetric, GeoMetric, SearchConsoleData, VisitorIdentityRecord } from '@/types/analytics';

// Modular Analytics Components
import AnalyticsHeader from './components/analytics/AnalyticsHeader';
import KpiSummaryGrid from './components/analytics/KpiSummaryGrid';
import TrafficTrendChart from './components/analytics/TrafficTrendChart';
import AttributionBreakdownCard from './components/analytics/AttributionBreakdownCard';
import ConversionFunnelCard from './components/analytics/ConversionFunnelCard';
import TopJewelsCard from './components/analytics/TopJewelsCard';
import TopPagesCard from './components/analytics/TopPagesCard';
import GeoDistributionCard from './components/analytics/GeoDistributionCard';
import GscSeoHealthCard from './components/analytics/GscSeoHealthCard';
import LiveVisitorStream from './components/analytics/LiveVisitorStream';

// Dedicated Drill-Down Modals
import PagesDrillDownModal from './components/analytics/modals/PagesDrillDownModal';
import CampaignsDrillDownModal from './components/analytics/modals/CampaignsDrillDownModal';
import GeoDrillDownModal from './components/analytics/modals/GeoDrillDownModal';
import CustomDateRangeModal from './components/analytics/modals/CustomDateRangeModal';

interface AnalyticsDashboardProps {
  pageViews?: any[];
  dailyAnalytics?: any[];
  identities?: any[];
  products?: any[];
  orders?: any[];
  carts?: any[];
}

export default function AnalyticsDashboard({
  pageViews = [],
  dailyAnalytics = [],
  identities = [],
  products = [],
  orders = [],
  carts = [],
}: AnalyticsDashboardProps) {
  // 1. Time Filter State
  const [timeRange, setTimeRange] = useState<DateRangeKey>('7d');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  // 2. Data State
  const [summary, setSummary] = useState<KpiSummary | null>(null);
  const [timeseries, setTimeseries] = useState<TimeSeriesPoint[]>([]);
  const [timeseriesInterval, setTimeseriesInterval] = useState<'hour' | 'day'>('day');
  const [channels, setChannels] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [referrers, setReferrers] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [funnelChannel, setFunnelChannel] = useState<string>('all');
  const [topPages, setTopPages] = useState<TopPageMetric[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductMetric[]>([]);
  const [geoCities, setGeoCities] = useState<GeoMetric[]>([]);
  const [geoCountries, setGeoCountries] = useState<any[]>([]);
  const [gscData, setGscData] = useState<SearchConsoleData | null>(null);

  // 3. Stream State
  const [stream, setStream] = useState<any[]>([]);
  const [streamTotal, setStreamTotal] = useState<number>(0);
  const [streamPage, setStreamPage] = useState<number>(1);
  const [streamTotalPages, setStreamTotalPages] = useState<number>(1);
  const [streamRowsPerPage, setStreamRowsPerPage] = useState<number>(25);
  const [streamSearch, setStreamSearch] = useState<string>('');
  const [streamChannel, setStreamChannel] = useState<string>('all');

  // 4. Loading States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStreamLoading, setIsStreamLoading] = useState<boolean>(false);

  // 5. Modal States
  const [isPagesModalOpen, setIsPagesModalOpen] = useState<boolean>(false);
  const [isCampaignsModalOpen, setIsCampaignsModalOpen] = useState<boolean>(false);
  const [isGeoModalOpen, setIsGeoModalOpen] = useState<boolean>(false);
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState<boolean>(false);

  // Helpers for query params
  const getRangeQueryParams = useCallback(() => {
    let q = `range=${timeRange}`;
    if (timeRange === 'custom' && customFrom && customTo) {
      q += `&from=${customFrom}&to=${customTo}`;
    }
    return q;
  }, [timeRange, customFrom, customTo]);

  // Main Data Fetcher
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    const rangeParams = getRangeQueryParams();

    try {
      const [
        summaryRes,
        timeseriesRes,
        sourcesRes,
        funnelRes,
        pagesRes,
        geoRes,
        gscRes,
      ] = await Promise.all([
        fetch(`/api/admin/analytics/summary?${rangeParams}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/admin/analytics/timeseries?${rangeParams}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/admin/analytics/sources?${rangeParams}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/admin/analytics/funnel?${rangeParams}&channel=${funnelChannel}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/admin/analytics/pages?${rangeParams}&limit=100`).then((r) => r.json()).catch(() => null),
        fetch(`/api/admin/analytics/geo?${rangeParams}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/admin/analytics/search-console?${rangeParams}`).then((r) => r.json()).catch(() => null),
      ]);

      if (summaryRes) setSummary(summaryRes);
      if (timeseriesRes?.points) {
        setTimeseries(timeseriesRes.points);
        setTimeseriesInterval(timeseriesRes.interval || (timeRange === 'today' ? 'hour' : 'day'));
      }
      if (sourcesRes) {
        setChannels(sourcesRes.channels || []);
        setCampaigns(sourcesRes.campaigns || []);
        setReferrers(sourcesRes.referrers || []);
      }
      if (funnelRes) setFunnel(funnelRes);
      if (pagesRes) {
        setTopPages(pagesRes.pages || []);
        setTopProducts(pagesRes.products || []);
      }
      if (geoRes) {
        setGeoCities(geoRes.cities || geoRes.geo_metrics || []);
        setGeoCountries(geoRes.countries || []);
      }
      if (gscRes) setGscData(gscRes);
    } catch (err) {
      console.error('Error fetching analytics dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getRangeQueryParams, funnelChannel, timeRange]);

  // Stream Data Fetcher
  const fetchStreamData = useCallback(async () => {
    setIsStreamLoading(true);
    try {
      const params = new URLSearchParams({
        page: streamPage.toString(),
        limit: streamRowsPerPage.toString(),
      });
      if (streamSearch.trim()) params.append('search', streamSearch.trim());
      if (streamChannel !== 'all') params.append('channel', streamChannel);

      const res = await fetch(`/api/admin/analytics/stream?${params.toString()}`);
      const data = await res.json();
      if (data.stream) {
        setStream(data.stream);
        setStreamTotal(data.total || data.stream.length);
        setStreamTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching stream data:', err);
    } finally {
      setIsStreamLoading(false);
    }
  }, [streamPage, streamRowsPerPage, streamSearch, streamChannel]);

  // Initial and range change triggers
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchStreamData();
  }, [fetchStreamData]);

  // Handle Funnel channel change separately
  const handleFunnelChannelChange = async (channel: string) => {
    setFunnelChannel(channel);
    const rangeParams = getRangeQueryParams();
    try {
      const res = await fetch(`/api/admin/analytics/funnel?${rangeParams}&channel=${channel}`);
      const data = await res.json();
      if (data) setFunnel(data);
    } catch (err) {
      console.error('Error filtering funnel by channel:', err);
    }
  };

  // Handle Date Range switches
  const handleTimeRangeChange = (newRange: DateRangeKey) => {
    setTimeRange(newRange);
    if (newRange !== 'custom') {
      setCustomFrom('');
      setCustomTo('');
    }
  };

  const handleApplyCustomDate = (from: string, to: string) => {
    setCustomFrom(from);
    setCustomTo(to);
    setTimeRange('custom');
  };

  // Handle Identity update
  const handleIdentityUpdated = (visitorId: string, newIdentity: VisitorIdentityRecord) => {
    setStream((prev) =>
      prev.map((item) =>
        item.visitor_id === visitorId ? { ...item, identity: newIdentity } : item
      )
    );
  };

  // Range Label formatting
  const rangeLabel = useMemo(() => {
    switch (timeRange) {
      case 'today':
        return 'Andamento di Oggi (24 Ore)';
      case '7d':
        return 'Andamento Ultimi 7 Giorni';
      case '30d':
        return 'Andamento Ultimi 30 Giorni';
      case 'month':
        return 'Andamento Mese Corrente';
      case 'custom':
        return customFrom && customTo ? `Andamento ${customFrom} → ${customTo}` : 'Andamento Personalizzato';
      default:
        return 'Andamento Temporale';
    }
  }, [timeRange, customFrom, customTo]);

  // Unified CSV Export
  const handleExportGlobalCSV = () => {
    const lines: string[] = [];
    const dateStr = new Date().toISOString().split('T')[0];

    lines.push(`ISABEL PEPE - LUXURY ANALYTICS REPORT (${dateStr})`);
    lines.push(`Periodo Analizzato: ${rangeLabel}`);
    lines.push('');

    // Section 1: Executive KPI
    lines.push('--- RIEPILOGO ESECUTIVO ---');
    lines.push('Metrica,Valore');
    lines.push(`Visitatori Unici Reali,${summary?.real_unique_visitors || 0}`);
    lines.push(`Visualizzazioni Totali,${summary?.total_page_views || 0}`);
    lines.push(`Sessioni Totali,${summary?.total_sessions || 0}`);
    lines.push(`Frequenza di Rimbalzo,${summary?.bounce_rate || 0}%`);
    lines.push(`Permanenza Media (sec),${summary?.avg_session_duration_seconds || 0}`);
    lines.push(`Ordini Conclusi,${summary?.total_orders || 0}`);
    lines.push(`Fatturato Totale (€),${summary?.total_revenue || 0}`);
    lines.push(`Tasso di Conversione E-Commerce,${summary?.conversion_rate || 0}%`);
    lines.push('');

    // Section 2: Channels
    lines.push('--- ATTRIBUZIONE CANALI DI TRAFFICO ---');
    lines.push('Canale,Visitatori,Sessioni,Pagine/Sessione,Rimbalzo (%),Ordini,Fatturato (€),Conv. Rate (%)');
    channels.forEach((c) => {
      lines.push(`"${c.channel}",${c.unique_visitors},${c.sessions},${c.pages_per_session},${c.bounce_rate}%,${c.orders},${c.revenue},${c.conversion_rate}%`);
    });
    lines.push('');

    // Section 3: Top Pages
    lines.push('--- TOP PAGINE ESPLORATE ---');
    lines.push('Percorso (URL),Visualizzazioni,Visitatori Unici,Permanenza (sec),Rimbalzo (%)');
    topPages.slice(0, 25).forEach((p) => {
      lines.push(`"${p.path}",${p.views_count},${p.unique_visitors},${p.avg_time_seconds},${p.bounce_rate}%`);
    });
    lines.push('');

    // Section 4: Top Geo
    lines.push('--- TOP CITTA ITALIANE ---');
    lines.push('Citta,Regione,Visitatori,Sessioni,Ordini,Fatturato (€)');
    geoCities.slice(0, 25).forEach((c) => {
      lines.push(`"${c.city}","${c.region || 'N/A'}",${c.visitors_count},${c.sessions_count},${c.orders_count},${c.revenue}`);
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `isabel_pepe_analytics_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 1. Header & Time Filter Controls */}
      <AnalyticsHeader
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        onOpenCustomDateModal={() => setIsCustomDateModalOpen(true)}
        onRefresh={() => {
          fetchDashboardData();
          fetchStreamData();
        }}
        onExportData={handleExportGlobalCSV}
        isLoading={isLoading}
        customDateLabel={customFrom && customTo ? `${customFrom.slice(5)} → ${customTo.slice(5)}` : null}
      />

      {/* 2. 5 Core KPI Luxury Summary Cards */}
      <KpiSummaryGrid summary={summary} isLoading={isLoading} />

      {/* 3. Interactive Traffic Trend SVG Chart */}
      <TrafficTrendChart
        points={timeseries}
        interval={timeseriesInterval}
        rangeLabel={rangeLabel}
        isLoading={isLoading}
      />

      {/* 4. Conversion Funnel (5-Stage Purchasing Journey) */}
      <ConversionFunnelCard
        funnel={funnel}
        selectedChannel={funnelChannel}
        onChannelChange={handleFunnelChannelChange}
        isLoading={isLoading}
      />

      {/* 5. Attribution Breakdown & Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <AttributionBreakdownCard
          channels={channels}
          onOpenCampaignsModal={() => setIsCampaignsModalOpen(true)}
          isLoading={isLoading}
        />
        <TopPagesCard
          pages={topPages}
          totalViews={summary?.total_page_views}
          onOpenPagesModal={() => setIsPagesModalOpen(true)}
          isLoading={isLoading}
        />
      </div>

      {/* 6. Top Jewels & Geolocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <TopJewelsCard products={topProducts} isLoading={isLoading} />
        <GeoDistributionCard
          cities={geoCities}
          countries={geoCountries}
          onOpenGeoModal={() => setIsGeoModalOpen(true)}
          isLoading={isLoading}
        />
      </div>

      {/* 7. Google Search Console & SEO Health */}
      <GscSeoHealthCard gscData={gscData} isLoading={isLoading} />

      {/* 8. Live Visitor Stream with Identity Tagging */}
      <LiveVisitorStream
        stream={stream}
        totalCount={streamTotal}
        currentPage={streamPage}
        totalPages={streamTotalPages}
        rowsPerPage={streamRowsPerPage}
        onPageChange={setStreamPage}
        onRowsPerPageChange={(rows) => {
          setStreamRowsPerPage(rows);
          setStreamPage(1);
        }}
        searchTerm={streamSearch}
        onSearchChange={(s) => {
          setStreamSearch(s);
          setStreamPage(1);
        }}
        channelFilter={streamChannel}
        onChannelFilterChange={(c) => {
          setStreamChannel(c);
          setStreamPage(1);
        }}
        onIdentityUpdated={handleIdentityUpdated}
        isLoading={isStreamLoading}
      />

      {/* Dedicated Drill-Down Modals */}
      <PagesDrillDownModal
        isOpen={isPagesModalOpen}
        onClose={() => setIsPagesModalOpen(false)}
        pages={topPages}
        timeRangeLabel={rangeLabel}
      />

      <CampaignsDrillDownModal
        isOpen={isCampaignsModalOpen}
        onClose={() => setIsCampaignsModalOpen(false)}
        channels={channels}
        campaigns={campaigns}
        referrers={referrers}
        timeRangeLabel={rangeLabel}
      />

      <GeoDrillDownModal
        isOpen={isGeoModalOpen}
        onClose={() => setIsGeoModalOpen(false)}
        cities={geoCities}
        countries={geoCountries}
        timeRangeLabel={rangeLabel}
      />

      <CustomDateRangeModal
        isOpen={isCustomDateModalOpen}
        onClose={() => setIsCustomDateModalOpen(false)}
        onApply={handleApplyCustomDate}
        initialFrom={customFrom}
        initialTo={customTo}
      />
    </div>
  );
}
