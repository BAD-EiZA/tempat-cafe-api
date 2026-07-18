#!/usr/bin/env node
/**
 * Minimal printer agent — polls BE for print jobs and prints via TCP ESC/POS or stdout.
 *
 * Usage:
 *   DEVICE_TOKEN=... API_BASE=http://localhost:3000/api/v1 node scripts/printer-agent.mjs
 *   PRINTER_HOST=192.168.1.50 PRINTER_PORT=9100 ... (optional TCP)
 */
import net from 'net';

const API = process.env.API_BASE || 'http://localhost:3000/api/v1';
const TOKEN = process.env.DEVICE_TOKEN;
const HOST = process.env.PRINTER_HOST || '';
const PORT = Number(process.env.PRINTER_PORT || 9100);
const INTERVAL = Number(process.env.POLL_MS || 2000);

if (!TOKEN) {
  console.error('DEVICE_TOKEN required');
  process.exit(1);
}

function escpos(payload) {
  const lines = [];
  lines.push('\x1b\x40'); // init
  lines.push('\x1b\x61\x01'); // center
  lines.push(`${payload.orderNumber || 'ORDER'}\n`);
  lines.push(`${payload.station || ''}\n`);
  lines.push('\x1b\x61\x00'); // left
  lines.push('----------------\n');
  for (const i of payload.items || []) {
    lines.push(`${i.qty || 1}x ${i.name || ''}\n`);
    if (i.notes) lines.push(`  * ${i.notes}\n`);
  }
  if (payload.notes) lines.push(`Note: ${payload.notes}\n`);
  lines.push('----------------\n\n\n');
  lines.push('\x1d\x56\x00'); // cut
  return Buffer.from(lines.join(''), 'binary');
}

function sendTcp(buf) {
  return new Promise((resolve, reject) => {
    const s = net.connect({ host: HOST, port: PORT }, () => {
      s.write(buf, () => {
        s.end();
        resolve();
      });
    });
    s.on('error', reject);
  });
}

async function heartbeat() {
  await fetch(`${API}/printers/agents/heartbeat`, {
    method: 'POST',
    headers: { 'x-device-token': TOKEN },
  });
}

async function tick() {
  const res = await fetch(`${API}/printers/jobs/next`, {
    headers: { 'x-device-token': TOKEN },
  });
  if (!res.ok) {
    console.error('next job', res.status);
    return;
  }
  const job = await res.json();
  if (!job || !job.id) return;

  const payload = job.payload || {};
  const buf = escpos(payload);
  try {
    if (HOST) {
      await sendTcp(buf);
      console.log('printed', job.id, payload.orderNumber);
    } else {
      console.log('--- PRINT JOB', job.id, '---');
      console.log(JSON.stringify(payload, null, 2));
    }
    await fetch(`${API}/printers/jobs/${job.id}/ack`, {
      method: 'POST',
      headers: { 'x-device-token': TOKEN },
    });
  } catch (e) {
    console.error('print fail', e.message);
    await fetch(`${API}/printers/jobs/${job.id}/fail`, {
      method: 'POST',
      headers: { 'x-device-token': TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(e.message || e) }),
    });
  }
}

console.log('printer-agent start', API, HOST ? `${HOST}:${PORT}` : 'stdout');
setInterval(() => heartbeat().catch(() => undefined), 30_000);
setInterval(() => tick().catch((e) => console.error(e)), INTERVAL);
heartbeat().catch(() => undefined);
tick().catch(() => undefined);
