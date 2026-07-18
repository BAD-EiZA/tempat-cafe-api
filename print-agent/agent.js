/**
 * Local Print Agent — polls backend for ESC/POS jobs.
 * Env: API_BASE, DEVICE_TOKEN, POLL_MS
 */
const API_BASE = process.env.API_BASE || 'http://localhost:3000/api/v1';
const DEVICE_TOKEN = process.env.DEVICE_TOKEN;
const POLL_MS = Number(process.env.POLL_MS || 3000);

if (!DEVICE_TOKEN) {
  console.error('DEVICE_TOKEN required');
  process.exit(1);
}

async function heartbeat() {
  await fetch(`${API_BASE}/printers/agents/heartbeat`, {
    method: 'POST',
    headers: { 'x-device-token': DEVICE_TOKEN },
  });
}

async function nextJob() {
  const res = await fetch(`${API_BASE}/printers/jobs/next`, {
    headers: { 'x-device-token': DEVICE_TOKEN },
  });
  if (!res.ok) return null;
  const text = await res.text();
  if (!text || text === 'null') return null;
  return JSON.parse(text);
}

async function ack(id) {
  await fetch(`${API_BASE}/printers/jobs/${id}/ack`, {
    method: 'POST',
    headers: { 'x-device-token': DEVICE_TOKEN },
  });
}

async function fail(id, error) {
  await fetch(`${API_BASE}/printers/jobs/${id}/fail`, {
    method: 'POST',
    headers: {
      'x-device-token': DEVICE_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error }),
  });
}

function formatTicket(payload) {
  const lines = [
    `=== ${payload.station || 'KITCHEN'} ===`,
    `Order: ${payload.orderNumber || '-'}`,
    '----------------',
  ];
  for (const item of payload.items || []) {
    lines.push(`${item.qty}x ${item.name}`);
    if (item.notes) lines.push(`  * ${item.notes}`);
  }
  if (payload.notes) {
    lines.push('----------------');
    lines.push(`Note: ${payload.notes}`);
  }
  lines.push('================');
  return lines.join('\n');
}

async function printJob(job) {
  // Network ESC/POS when host set; otherwise log (dev fallback)
  const host = job.printer?.host;
  const port = job.printer?.port || 9100;
  const text = formatTicket(job.payload || {});

  if (!host) {
    console.log('[PRINT FALLBACK]\n' + text);
    return;
  }

  try {
    const net = await import('node:net');
    await new Promise((resolve, reject) => {
      const socket = net.createConnection({ host, port }, () => {
        socket.write(text + '\n\n\n');
        socket.end();
      });
      socket.on('close', resolve);
      socket.on('error', reject);
      setTimeout(() => reject(new Error('print timeout')), 10_000);
    });
  } catch (e) {
    throw e;
  }
}

async function loop() {
  try {
    await heartbeat();
    const job = await nextJob();
    if (job) {
      console.log('Claimed job', job.id);
      try {
        await printJob(job);
        await ack(job.id);
        console.log('Printed', job.id);
      } catch (e) {
        console.error('Print failed', e);
        await fail(job.id, String(e.message || e));
      }
    }
  } catch (e) {
    console.error('Loop error', e.message || e);
  }
  setTimeout(loop, POLL_MS);
}

console.log('Print agent starting…');
loop();
