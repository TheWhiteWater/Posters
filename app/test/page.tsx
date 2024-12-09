'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [apiStatus, setApiStatus] = useState<{
    status?: string;
    message?: string;
    modelsCount?: number;
    error?: string;
  }>({});

  useEffect(() => {
    fetch('/api/test')
      .then(res => res.json())
      .then(data => setApiStatus(data))
      .catch(error => setApiStatus({ status: 'error', error: error.message }));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      <div className="bg-white p-4 rounded shadow">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(apiStatus, null, 2)}
        </pre>
      </div>
    </div>
  );
}