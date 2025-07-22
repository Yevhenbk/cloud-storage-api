'use client';

import React, { useState } from 'react';
import { sendToCloud } from '@/actions/actions';

/**
 * Form component to trigger data upload to Google Cloud Storage.
 */
export default function UploadForm(): React.JSX.Element {
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage('Uploading...');

    const result: { success: true; uploaded: string[] } | { success: false; message: string } = await sendToCloud();


    if (result.success) {
      setMessage(`✅ Uploaded files: ${result.uploaded.join(', ')}`);
    } else {
      setMessage(`❌ ${result.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Send Test Data to Cloud
      </button>
      <p className="text-sm mt-2">{message}</p>
    </form>
  );
}
