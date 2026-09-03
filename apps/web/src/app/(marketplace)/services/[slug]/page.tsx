import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceLanding } from './service-landing';
import { getServiceCategory, SERVICE_CATEGORIES } from '@/lib/service-catalog';

type ServicePageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return SERVICE_CATEGORIES.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: ServicePageProps): Metadata {
  const service = getServiceCategory(params.slug);

  if (!service) return {};

  return {
    title: service.name,
    description: service.description,
    openGraph: {
      title: `${service.name} | پرنگارین`,
      description: service.description,
    },
  };
}

export default function ServicePage({ params }: ServicePageProps) {
  const service = getServiceCategory(params.slug);

  if (!service) notFound();

  return <ServiceLanding service={service} />;
}
