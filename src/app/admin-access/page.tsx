'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function AdminAccessPage() {
    const router = useRouter();
    const [groupCode, setGroupCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Navigate to admin page with the group code
        router.push(`/admin/${groupCode.toUpperCase()}`);
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-[#FFFBEB]">
            <Card className="max-w-[400px] w-full animate-fade-in-up">
                <Link href="/" className="text-sm text-text-muted hover:underline mb-4 inline-block">
                    ← Voltar ao início
                </Link>

                <h1 className="text-center text-2xl font-bold text-primary mb-2">👑 Área do Organizador</h1>
                <p className="text-center text-sm text-text-muted mb-8">
                    Digite o código do grupo que você criou para gerenciá-lo.
                </p>

                <form onSubmit={handleAccess} className="flex flex-col gap-6">
                    <Input
                        label="Código do Grupo"
                        placeholder="Ex: TFVJS4"
                        value={groupCode}
                        onChange={e => setGroupCode(e.target.value.toUpperCase())}
                        required
                        maxLength={8}
                        className="text-center text-lg tracking-widest uppercase"
                    />

                    <Button type="submit" fullWidth isLoading={isLoading}>
                        Acessar Gerenciamento
                    </Button>
                </form>

                <p className="text-center text-xs text-text-muted mt-6">
                    O código do grupo foi exibido quando você criou o sorteio.
                </p>
            </Card>
        </div>
    );
}
