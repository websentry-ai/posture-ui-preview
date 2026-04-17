import Link from 'next/link';
import { notFound } from 'next/navigation';
import { devices, findings } from '@/lib/mock-data';
import DeviceDetailClient from './client';

export async function generateStaticParams() {
  return devices.map((d) => ({ id: d.id }));
}

export default function DeviceDetail({ params }: { params: { id: string } }) {
  const device = devices.find((d) => d.id === params.id);
  if (!device) return notFound();
  const deviceFindings = findings.filter((f) => f.device === device.id);
  return <DeviceDetailClient device={device} findings={deviceFindings} />;
}
