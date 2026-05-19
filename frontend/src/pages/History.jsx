import { useEffect, useState } from 'react';
import axios from 'axios';

export default function History() {
  const [uploads, setUploads] = useState([]);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUploads();
    fetchRecords();
  }, []);

  const fetchUploads = async () => {
    try {
      const res = await axios.get('/api/history/uploads');
      setUploads(res.data);
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/records');
      console.log('Records:', res.data);
      setRecords(res.data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    }
  };

  const filteredRecords = records.filter(record => 
    record.work_order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.employee_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">History & Search</h1>
        <p className="text-gray-600 mt-1">View and search processed documents</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <input
          type="text"
          placeholder="Search by Work Order, Employee Number, or Summary..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Recent Uploads */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Uploads</h3>
        <div className="space-y-3">
          {uploads.slice(0, 5).map(upload => (
            <div key={upload.id} className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">{upload.filename}</p>
                <p className="text-sm text-gray-500">{new Date(upload.uploaded_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {uploads.length === 0 && (
            <p className="text-gray-400 text-center py-8">No uploads yet</p>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Processed Records ({filteredRecords.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    {record.work_order_number ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Manufacturing</span>
                    ) : (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Document</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">{record.work_order_number || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.date || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.shift || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.employee_number || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.machine_number || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.quantity_produced || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                    {record.summary || (record.work_order_number ? 'Manufacturing record' : 'Text document')}
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
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
