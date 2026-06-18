import dynamic from 'next/dynamic';

export const DynamicAmbientBackground = dynamic(() => import('@/app/components/UnifiedBackground'), { ssr: false });
export const DynamicSciFiOverlay = dynamic(() => import('@/app/components/SciFiOverlay'), { ssr: false, loading: () => null });
export const DynamicHolographicLoader = dynamic(() => import('@/app/components/HolographicLoader'), { ssr: false });
export const DynamicTestimonials = dynamic(() => import('@/app/components/Testimonials'), { ssr: false });
export const DynamicFooter = dynamic(() => import('@/app/components/footer'), { ssr: false });
