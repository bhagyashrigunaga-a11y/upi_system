import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import { transactionAPI, aiAPI } from '../services/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const riskColor = (risk) => {
  if (risk < 35) return '#34d399';
  if (risk < 70) return '#fbbf24';
  return '#f87171';
};

const sampleLocationByMerchant = (merchant = '') => {
  const normalized = merchant.toLowerCase();
  if (normalized.includes('uber') || normalized.includes('ola')) return 'Bengaluru';
  if (normalized.includes('swiggy') || normalized.includes('zomato')) return 'Hyderabad';
  if (normalized.includes('amazon') || normalized.includes('flipkart')) return 'Mumbai';
  if (normalized.includes('hotel') || normalized.includes('travel')) return 'Delhi';
  return 'Chennai';
};

const formatTime = (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const normalizeCityName = (city = '') => {
  if (city.toLowerCase() === 'bengaluru') return 'Bangalore';
  return city;
};

const fetchLocationName = async (latitude, longitude) => {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
  );

  if (!response.ok) {
    throw new Error('Reverse geocoding failed');
  }

  const data = await response.json();
  const city =
    data.city ||
    data.localityInfo?.administrative?.find((item) => item.description?.includes('city'))?.name ||
    data.localityInfo?.administrative?.[2]?.name ||
    data.locality;

  return city ? normalizeCityName(city) : 'Unknown location';
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    monthlySpending: 0,
    averageTransaction: 0,
    transactionCount: 0,
    categorySpending: {},
    recentTransactions: [],
  });
  const [prediction, setPrediction] = useState({ predictedExpense: 0 });
  const [fraudAlerts, setFraudAlerts] = useState({ alertCount: 0, alerts: [] });
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState('Unknown');
  const [trustScore, setTrustScore] = useState(93);
  const [securityScore, setSecurityScore] = useState(86);
  const [riskScore, setRiskScore] = useState(22);
  const [locationRisk, setLocationRisk] = useState('Low');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const statsRes = await transactionAPI.getStats();
        setStats((prev) => ({ ...prev, ...statsRes.data.stats }));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }

      try {
        const predictionRes = await aiAPI.predictExpense();
        setPrediction(predictionRes.data.prediction || { predictedExpense: 0 });
      } catch (error) {
        console.warn('Prediction unavailable:', error.message || error);
      }

      try {
        const fraudRes = await aiAPI.detectFraud();
        setFraudAlerts({
          alertCount: fraudRes.data.alertCount || 0,
          alerts: Array.isArray(fraudRes.data.alerts) ? fraudRes.data.alerts : [],
        });
      } catch (error) {
        console.warn('Fraud detection unavailable:', error.message || error);
        try {
          const fallbackRes = await aiAPI.getFraudAlerts();
          setFraudAlerts({
            alertCount: fallbackRes.data.alertCount || 0,
            alerts: Array.isArray(fallbackRes.data.alerts) ? fallbackRes.data.alerts : [],
          });
        } catch (fallbackError) {
          console.warn('Fallback fraud alert fetch failed:', fallbackError.message || fallbackError);
        }
      }

      setLoading(false);
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCurrentLocation('Geolocation not supported');
      return;
    }

    setCurrentLocation('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const locationName = await fetchLocationName(latitude, longitude);
          setCurrentLocation(locationName);
        } catch (error) {
          console.error('Error resolving location name:', error);
          setCurrentLocation('Unable to detect location');
        }
      },
      () => {
        setCurrentLocation('Location access denied');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  useEffect(() => {
    const score = Math.max(14, 28 + (fraudAlerts.alertCount || 0) * 22);
    setRiskScore(Math.min(score, 92));
    setTrustScore(Math.max(40, 95 - (fraudAlerts.alertCount || 0) * 15));
    setSecurityScore(Math.max(42, 90 - (fraudAlerts.alertCount || 0) * 18));

    if ((fraudAlerts.alertCount || 0) >= 3) {
      setLocationRisk('High');
    } else if ((fraudAlerts.alertCount || 0) >= 1) {
      setLocationRisk('Medium');
    } else {
      setLocationRisk('Low');
    }
  }, [fraudAlerts]);

  const chartData = useMemo(() => {
    const result = { daily: [], weekly: [], monthly: [] };
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (6 - index));
      return { label: day.toLocaleDateString('en-US', { weekday: 'short' }), value: 0 };
    });

    const weeks = Array.from({ length: 4 }, (_, index) => ({ label: `W-${4 - index}`, value: 0 }));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].slice(-4).map((label) => ({ label, value: Math.round(stats.monthlySpending / 4) }));

    stats.recentTransactions?.forEach((item) => {
      const date = new Date(item.date);
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      const foundDay = days.find((d) => d.label === dayLabel);
      if (foundDay) foundDay.value += item.amount;

      const weekIndex = Math.min(3, Math.floor((now.getDate() - date.getDate()) / 7));
      if (weeks[3 - weekIndex]) weeks[3 - weekIndex].value += item.amount;
    });

    return { daily: days, weekly: weeks, monthly: months };
  }, [stats.recentTransactions, stats.monthlySpending]);

  const trustLabel = trustScore > 80 ? 'Trusted' : trustScore > 60 ? 'Warning' : 'Risky';
  const locationStatus = locationRisk === 'High' ? 'Suspicious location change detected' : locationRisk === 'Medium' ? 'Monitor your recent location patterns' : 'Location patterns look stable';

  const alerts = fraudAlerts.alerts?.slice(0, 3) || [
    { id: 'sample-1', title: 'Multiple micro-transactions detected', subtitle: '5 Rxns in 8 minutes', severity: 'Medium' },
  ];

  const recommendations = [
    'Enable two-factor authorization for UPI payments.',
    'Review new receiver identities before approval.',
    'Avoid transactions outside your usual hours.',
  ];

  const transactionsTable = stats.recentTransactions?.map((tx) => ({
    id: tx._id,
    amount: tx.amount,
    receiver: tx.merchant,
    time: formatTime(tx.date),
    probability: tx.riskScore ? `${Math.round(tx.riskScore * 100)}%` : '12%',
    status: tx.isFraudulent ? 'Suspicious' : 'Safe',
  })) || [];

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-white/10 bg-slate-900/80 px-8 py-10 text-center shadow-soft">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <p className="text-lg font-semibold">Loading the AI fraud dashboard...</p>
          <p className="max-w-md text-sm text-slate-400">Connecting to transaction services and preparing analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="glass-card p-6"
          >
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Live Finance Shield</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">AI Fraud Detection Overview</h1>
                <p className="mt-2 max-w-2xl text-slate-400">Monitor your UPI micro-transactions with intelligent risk scoring, live alerts, and security recommendations.</p>
              </div>
              <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 shadow-soft">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current Location</p>
                <p className="text-sm text-white">{currentLocation}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-soft">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Security Score</p>
                <p className="mt-3 text-4xl font-semibold text-white">{securityScore}</p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${securityScore}%` }} />
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-soft">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Fraud Risk Score</p>
                <p className="mt-3 text-4xl font-semibold text-white">{riskScore}%</p>
                <p className="mt-2 text-sm text-slate-400">{riskScore < 35 ? 'Safe' : riskScore < 70 ? 'Medium' : 'High risk'}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-soft">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">UPI Trust Score</p>
                <p className="mt-3 text-4xl font-semibold text-white">{trustScore}</p>
                <p className="mt-2 text-sm text-slate-400">{trustLabel} recipients</p>
              </div>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="glass-card p-6 shadow-soft"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Alerts panel</p>
                <h2 className="text-2xl font-semibold text-white">Live Fraud Alerts</h2>
              </div>
              <span className="rounded-full bg-rose-500/10 px-3 py-1 text-sm font-semibold text-rose-300">
                {fraudAlerts.alertCount || 0} Active
              </span>
            </div>

            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={alert.id || index} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{alert.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{alert.subtitle || 'Suspicious transaction pattern detected'}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${alert.severity === 'High' ? 'bg-rose-500/15 text-rose-300' : alert.severity === 'Medium' ? 'bg-amber-400/15 text-amber-300' : 'bg-emerald-400/15 text-emerald-300'}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate('/fraud-detection')}
              className="mt-6 w-full rounded-3xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-soft transition hover:brightness-110"
            >
              Review full alert history
            </button>
          </motion.aside>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">AI Recommendations</p>
                <h3 className="text-xl font-semibold text-white">Fraud Prevention Tips</h3>
              </div>
            </div>
            <ul className="space-y-3">
              {recommendations.map((item, index) => (
                <li key={index} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300 shadow-soft">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">{index + 1}</span>
                    <p>{item}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Location Risk</p>
                <h3 className="text-xl font-semibold text-white">Location-Based Analysis</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${locationRisk === 'High' ? 'bg-rose-500/15 text-rose-300' : locationRisk === 'Medium' ? 'bg-amber-400/15 text-amber-300' : 'bg-emerald-400/15 text-emerald-300'}`}>
                {locationRisk}
              </span>
            </div>
            <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
              <p><span className="font-semibold text-slate-100">Current location:</span> {currentLocation}</p>
              <p><span className="font-semibold text-slate-100">Last transaction location:</span> {stats.recentTransactions[0] ? sampleLocationByMerchant(stats.recentTransactions[0].merchant) : 'N/A'}</p>
              <p>{locationStatus}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Risk Overview</p>
                <h3 className="text-xl font-semibold text-white">Security & Trust</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Safe transactions</p>
                <p className="text-2xl font-semibold text-white">{Math.max(0, stats.transactionCount - fraudAlerts.alertCount)}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Trust score</p>
                <p className="mt-2 text-3xl font-semibold text-white">{trustScore}/100</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Fraud risk</p>
                <p className="mt-2 text-3xl font-semibold text-white">{riskScore}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_0.8fr]">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Spending analytics</p>
                <h2 className="text-2xl font-semibold text-white">Transaction Trends</h2>
              </div>
              <div className="inline-flex overflow-hidden rounded-full border border-white/10 bg-slate-900/80 text-sm text-slate-300">
                <button className="px-4 py-2 text-slate-100">Daily</button>
                <button className="px-4 py-2 hover:bg-white/5">Weekly</button>
                <button className="px-4 py-2 hover:bg-white/5">Monthly</button>
              </div>
            </div>
            <div className="space-y-10">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.15)', color: '#fff' }} />
                    <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="url(#dailyGradient)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Weekly spending</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.weekly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.15)', color: '#fff' }} />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[12, 12, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Monthly spending</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.monthly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.15)', color: '#fff' }} />
                        <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#22d3ee' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="glass-card p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Fraud radar</p>
                <h2 className="text-2xl font-semibold text-white">Risk Scorecard</h2>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-center shadow-soft">
              <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-slate-950/90 shadow-soft">
                <div
                  className="absolute inset-0 rounded-full border border-white/10"
                  style={{
                    background: `conic-gradient(${riskColor(riskScore)} ${riskScore * 3.6}deg, rgba(30, 41, 59, 0.7) 0deg)`,
                  }}
                />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-slate-950/90 text-center">
                  <p className="text-4xl font-semibold text-white">{riskScore}%</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">risk</p>
                </div>
              </div>
              <p className="max-w-xs text-sm leading-6 text-slate-400">The AI risk engine estimates your current transaction portfolio threat level and flags unusual patterns.</p>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Predicted expense</p>
                <p className="mt-2 text-3xl font-semibold text-white">₹{prediction?.predictedExpense || 0}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-sm text-slate-400">Total transactions</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stats.transactionCount}</p>
              </div>
            </div>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Recent transactions</p>
              <h2 className="text-2xl font-semibold text-white">Recent Activity</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
              Showing latest {transactionsTable.length} transactions
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80">
            <div className="grid grid-cols-5 gap-4 bg-slate-950/80 px-6 py-4 text-xs uppercase tracking-[0.25em] text-slate-500 sm:grid-cols-6">
              <span>Amount</span>
              <span className="hidden sm:block">Receiver</span>
              <span>Time</span>
              <span>Fraud Probability</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-white/5">
              {transactionsTable.map((row) => (
                <div key={row.id} className="grid grid-cols-5 gap-4 px-6 py-4 text-sm text-slate-200 sm:grid-cols-6">
                  <span className="font-semibold text-cyan-300">₹{row.amount.toFixed(2)}</span>
                  <span className="hidden sm:block text-slate-300">{row.receiver}</span>
                  <span>{row.time}</span>
                  <span className="text-slate-200">{row.probability}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${row.status === 'Suspicious' ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'}`}>{row.status}</span>
                </div>
              ))}
              {transactionsTable.length === 0 && (
                <div className="px-6 py-8 text-center text-slate-400">No recent transactions found to display.</div>
              )}
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Dashboard;
