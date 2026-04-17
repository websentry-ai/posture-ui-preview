import { notFound } from 'next/navigation';
import { devices, findings } from '@/lib/mock-data';
import DeviceDetailClient from './client';

export async function generateStaticParams() {
  return devices.map((d) => ({ id: d.id }));
}

export default async function DeviceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const device = devices.find((d) => d.id === id);
  if (!device) return notFound();
  const deviceFindings = findings.filter((f) => f.device === device.id);
  return <DeviceDetailClient device={device} findings={deviceFindings} />;
}
