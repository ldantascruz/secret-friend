import { getParticipantData } from '@/app/actions';
import ParticipantDashboard from './ParticipantDashboard';
import { redirect } from 'next/navigation';

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ParticipantPage({ params }: { params: { code: string } }) {
    const participant = await getParticipantData(params.code);

    if (!participant) {
        redirect('/access');
    }

    return <ParticipantDashboard participant={participant} />;
}
