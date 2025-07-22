// import { NextResponse } from 'next/server';
// import { sendToCloud } from '@/actions/actions';

// export async function GET(): Promise<NextResponse> {
//   console.log('⏱ Fetching & uploading data...');
//   await sendToCloud();

//   return NextResponse.json({ message: 'Data uploaded successfully' });
// }

// app/api/cron/route.ts
import { NextResponse } from 'next/server';
import { sendToCloud } from '@/actions/actions';

export async function GET(): Promise<NextResponse> {
  console.log('⏱ Server-side upload trigger');

  const result = await sendToCloud();

  if (result.success) {
    return NextResponse.json({ message: 'Upload completed', uploaded: result.uploaded });
  } else {
    return NextResponse.json({ message: result.message }, { status: 500 });
  }
}


// import { NextResponse } from 'next/server';
// import { sendToCloud } from '@/actions/actions';

// let intervalStarted = false;

// /**
//  * Initializes a cron-like job that uploads data to GCS every 5 minutes.
//  * The interval runs only once per instance.
//  */
// export async function GET(): Promise<NextResponse> {
//   if (!intervalStarted) {
//     setInterval(async () => {
//       console.log('⏱ Fetching & uploading data...');
//       await sendToCloud();
//     }, 5 * 60 * 100); // Every 5 minutes

//     intervalStarted = true;
//     console.log('🚀 Cron job started');
//   }

//   return NextResponse.json({ message: 'Cron job initialized' });
// }

