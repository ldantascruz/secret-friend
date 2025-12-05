import { getGroupAdmin } from '@/app/actions';
import AdminDashboard from '@/app/admin/[code]/AdminDashboard';
import { redirect } from 'next/navigation';

export default async function AdminPage({ params }: { params: { code: string } }) {
    const group = await getGroupAdmin(params.code);

    if (!group) {
        redirect('/');
    }

    return <AdminDashboard group={group} />;
}
