'use client';

/**
 * Home page that triggers the backend cron route on mount.
 */
export default function HomePage(): React.JSX.Element {
  // useEffect(() => {
  //   const initUpload = async (): Promise<void> => {
  //     try {
  //       await fetch('/api/cron');
  //     } catch (error) {
  //       console.error('Failed to initialize cron job:', error);
  //     }
  //   };

  //   initUpload();
  // }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Automatic Cloud Upload</h1>
      <p>Uploads JSONPlaceholder data to Google Cloud Storage every 5 minutes.</p>
    </main>
  );
}
