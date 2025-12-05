'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { loginParticipant } from '@/app/actions';

export default function AccessPage() {
    const router = useRouter();
    const [accessCode, setAccessCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Direct navigation to the participant page
            // In a real app we might want to validate existence first, but for now this is fine
            // The page itself will handle 404 if code is invalid
            router.push(`/p/${accessCode.toUpperCase()}`);
        } catch (err) {
            setError('Código inválido.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-[#FFFBEB]">
            <Card className="max-w-[400px] w-full animate-fade-in-up">
                <h1 className="text-center text-2xl font-bold text-primary mb-2">Acessar Amigo Secreto</h1>
                <p className="text-center text-sm text-text-muted mb-8">
                    Digite seu código de acesso pessoal recebido no WhatsApp.
                </p>

                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                    <Input
                        label="Seu Código de Acesso"
                        placeholder="Ex: ABC12345"
                        value={accessCode}
                        onChange={e => setAccessCode(e.target.value.toUpperCase())}
                        required
                        maxLength={8}
                        className="text-center text-lg tracking-widest uppercase"
                    />

                    {error && <p className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-sm">{error}</p>}

                    <Button type="submit" fullWidth isLoading={isLoading}>
                        Entrar
                    </Button>
                </form>
            </Card>
        </div>
    );
}
