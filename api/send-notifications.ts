import * as admin from 'firebase-admin';
import webpush from 'web-push';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT ?? '{}')
    ),
  });
}

webpush.setVapidDetails(
  'mailto:admin@mindfulme.app',
  process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY ?? '',
  process.env.VAPID_PRIVATE_KEY ?? ''
);

export default async function handler(req: any, res: any) {
  const authHeader = req.headers['authorization'] ?? '';
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const snapshot = await admin.firestore().collection('pushSubscriptions').get();

  const results = await Promise.allSettled(
    snapshot.docs.map(d => {
      const sub = d.data() as { endpoint: string; keys: { p256dh: string; auth: string } };
      return webpush.sendNotification(sub, JSON.stringify({
        title: 'MindfulMe 🌿',
        body: "Time to log your habits and check in with yourself today!",
      }));
    })
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return res.json({ sent, failed });
}
