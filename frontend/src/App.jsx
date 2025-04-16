import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [source, setSource] = useState('');
  const [columns, setColumns] = useState([]);
  const [table, setTable] = useState('');
  const [file, setFile] = useState(null);
  const [recordCount, setRecordCount] = useState(0);

  const handleClickHouseConnect = async () => {
    const res = await axios.post('http://localhost:5000/api/clickhouse/connect-clickhouse', {
      host: 'http://localhost',
      port: 8123,
      user: 'default',
      database: 'default',
      jwtToken: 'your-token-here'
    });

    console.log(res.data);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">ClickHouse - Flat File Ingestor</h1>
      <div className="mb-4">
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          onChange={e => setSource(e.target.value)}
        >
          <option value="">Select Source</option>
          <option value="clickhouse">ClickHouse</option>
          <option value="flatfile">Flat File</option>
        </select>
      </div>

      {source === 'clickhouse' && (
        <div className="mb-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleClickHouseConnect}
          >
            Connect to ClickHouse
          </button>
        </div>
      )}

      {source === 'flatfile' && (
        <div className="mb-4">
          <input
            type="file"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={e => setFile(e.target.files[0])}
          />
        </div>
      )}

      <div className="mt-6">
        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
          Start Ingestion
        </button>
        <p className="mt-4 text-gray-700">Records Processed: {recordCount}</p>
      </div>
    </div>
  );
};

export default App;
