import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecords();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/dashboard/stats');
      console.log('Dashboard stats:', res.data);
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/records');
      setRecords(res.data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process records for shift-wise data
  const shiftData = {};
  const machineData = {};
  
  records.forEach(record => {
    if (record.shift && record.shift !== '' && record.quantity_produced) {
      shiftData[record.shift] = (shiftData[record.shift] || 0) + (record.quantity_produced || 0);
    }
    if (record.machine_number && record.machine_number !== '' && record.quantity_produced) {
      machineData[record.machine_number] = (machineData[record.machine_number] || 0) + (record.quantity_produced || 0);
    }
  });
  
  const shiftChartData = Object.keys(shiftData).map(shift => ({
    shift: shift,
    totalQuantity: shiftData[shift]
  }));
  
  const machineChartData = Object.keys(machineData).map(machine => ({
    machine_number: machine,
    totalQuantity: machineData[machine]
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec489a'];
  
  // Confidence pie chart data
  const confidenceChartData = stats?.confidenceStats ? [
    { name: 'High (70-100%)', value: stats.confidenceStats.highConfidenceCount, color: '#10b981' },
    { name: 'Medium (40-69%)', value: stats.confidenceStats.mediumConfidenceCount, color: '#f59e0b' },
    { name: 'Low (0-39%)', value: stats.confidenceStats.lowConfidenceCount, color: '#ef4444' }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Operational metrics and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Uploads</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalUploads || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Records</p>
          <p className="text-3xl font-bold text-gray-900">{records.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Avg Confidence Score</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.confidenceStats?.averageConfidence || 0}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Validation Issues</p>
          <p className="text-3xl font-bold text-red-600">{stats?.validationStats?.totalWarnings + stats?.validationStats?.totalErrors || 0}</p>
        </div>
      </div>

      {/* Confidence & Validation Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Confidence Score Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🤖 AI Confidence Distribution</h3>
          {confidenceChartData.length > 0 && confidenceChartData[0].value > 0 ? (
            <>
              <PieChart width={500} height={250}>
                <Pie
                  data={confidenceChartData}
                  cx={250}
                  cy={120}
                  labelLine={true}
                  label={entry => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {confidenceChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="mt-4 text-center text-sm text-gray-500">
                Total fields analyzed: {stats?.confidenceStats?.totalFieldsAnalyzed || 0}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No confidence data available yet</p>
              <p className="text-sm mt-2">Extract documents to see AI confidence scores</p>
            </div>
          )}
        </div>

        {/* Validation Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">⚠️ Validation Summary</h3>
          {stats?.validationStats?.totalWarnings > 0 || stats?.validationStats?.totalErrors > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-800">Warnings</p>
                  <p className="text-sm text-yellow-600">Non-critical issues</p>
                </div>
                <p className="text-2xl font-bold text-yellow-700">{stats?.validationStats?.totalWarnings || 0}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-red-800">Errors</p>
                  <p className="text-sm text-red-600">Critical issues needing review</p>
                </div>
                <p className="text-2xl font-bold text-red-700">{stats?.validationStats?.totalErrors || 0}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">Records with Issues</p>
                  <p className="text-sm text-blue-600">Need attention</p>
                </div>
                <p className="text-2xl font-bold text-blue-700">{stats?.validationStats?.affectedRecords || 0}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>✅ No validation issues found</p>
              <p className="text-sm mt-2">All records passed validation</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts - Only show if there's manufacturing data */}
      {(shiftChartData.length > 0 || machineChartData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Shift-wise Production */}
          {shiftChartData.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shift-wise Production</h3>
              <BarChart width={500} height={300} data={shiftChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shift" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalQuantity" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </div>
          )}

          {/* Machine Performance */}
          {machineChartData.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Machine Performance</h3>
              <PieChart width={500} height={300}>
                <Pie
                  data={machineChartData}
                  cx={250}
                  cy={150}
                  labelLine={true}
                  label={entry => `${entry.machine_number}: ${entry.totalQuantity}`}
                  outerRadius={100}
                  dataKey="totalQuantity"
                >
                  {machineChartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          )}
        </div>
      )}

      {/* Recent Records Table with Confidence & Validation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Recent Records with Confidence & Validation</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.slice(0, 10).map((record) => {
                // Calculate average confidence for this record
                let avgConfidence = 0;
                let confidenceCount = 0;
                try {
                  const scores = JSON.parse(record.confidence_scores || '{}');
                  Object.values(scores).forEach(score => {
                    if (typeof score === 'number') {
                      avgConfidence += score;
                      confidenceCount++;
                    }
                  });
                  avgConfidence = confidenceCount > 0 ? Math.round((avgConfidence / confidenceCount) * 100) : 0;
                } catch(e) {}
                
                // Get validation issues
                let hasErrors = false;
                let hasWarnings = false;
                try {
                  const validation = JSON.parse(record.validation_errors || '{}');
                  hasErrors = Object.keys(validation.errors || {}).length > 0;
                  hasWarnings = Object.keys(validation.warnings || {}).length > 0;
                } catch(e) {}
                
                let confidenceColor = 'text-gray-400';
                if (avgConfidence >= 70) confidenceColor = 'text-green-600';
                else if (avgConfidence >= 40) confidenceColor = 'text-yellow-600';
                else if (avgConfidence > 0) confidenceColor = 'text-red-600';
                
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{record.work_order_number || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.date || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.shift || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.machine_number || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.quantity_produced || 0}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-semibold ${confidenceColor}`}>
                        {avgConfidence > 0 ? `${avgConfidence}%` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {hasErrors ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">⚠️ Errors</span>
                      ) : hasWarnings ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">⚠️ Warnings</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">✅ Valid</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                    No records found. Upload and extract documents to see data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
