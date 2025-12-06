import { redirect } from 'next/navigation';

interface Props {
    params: Promise<{
        code: string;
    }>;
}

export default async function AccessCodePage({ params }: Props) {
    const { code } = await params;

    // Redirect to the participant page with the access code
    redirect(`/p/${code.toUpperCase()}`);
}
