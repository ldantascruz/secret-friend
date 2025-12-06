'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { sendNotificationToParticipant, sendNotificationsToAllParticipants } from '@/app/actions';

interface Participant {
    id: string;
    name: string;
    phone: string;
    access_code: string;
    has_viewed_result: boolean;
    has_wishlist?: boolean;
}

interface Group {
    id: string;
    code: string;
    name: string;
    suggested_value?: number;
    event_date?: string;
    is_drawn: boolean;
    participants: Participant[];
}

interface Props {
    group: Group;
}

export default function AdminDashboard({ group }: Props) {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [sendingAll, setSendingAll] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const viewedCount = group.participants.filter(p => p.has_viewed_result).length;
    const wishlistCount = group.participants.filter(p => p.has_wishlist).length;
    const totalCount = group.participants.length;

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const sendToParticipant = async (participant: Participant) => {
        setSendingId(participant.id);
        setNotification(null);

        try {
            const result = await sendNotificationToParticipant(
                participant.id,
                group.name,
                group.code
            );

            if (result.success) {
                setNotification({ type: 'success', message: `Mensagem enviada para ${participant.name}!` });
            } else {
                setNotification({ type: 'error', message: result.error || 'Erro ao enviar mensagem' });
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Erro ao enviar mensagem. Verifique a Evolution API.' });
        } finally {
            setSendingId(null);
            setTimeout(() => setNotification(null), 5000);
        }
    };

    const sendToAll = async () => {
        setSendingAll(true);
        setNotification(null);

        try {
            const result = await sendNotificationsToAllParticipants(group.code);

            if (result.success) {
                setNotification({ type: 'success', message: `${result.sent} mensagens enviadas com sucesso!` });
            } else {
                setNotification({
                    type: 'error',
                    message: `Enviadas: ${result.sent}, Falhas: ${result.failed}`
                });
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Erro ao enviar mensagens. Verifique a Evolution API.' });
        } finally {
            setSendingAll(false);
            setTimeout(() => setNotification(null), 5000);
        }
    };

    return (
        <div className="max-w-[700px] mx-auto py-8 px-4">
            <div className="text-center mb-8">
                <Link href="/" className="text-sm text-text-muted hover:underline mb-4 inline-block">
                    ← Voltar ao início
                </Link>
                <h1 className="text-3xl font-bold text-primary mb-2">{group.name}</h1>
                <p className="text-text-muted">Código do grupo: <strong className="text-primary">{group.code}</strong></p>

                {group.event_date && (
                    <p className="text-sm text-gray-500 mt-2">
                        📅 Data do evento: {new Date(group.event_date).toISOString().split('T')[0]}
                    </p>
                )}
                {group.suggested_value && (
                    <p className="text-sm text-gray-500">
                        💰 Valor sugerido: R$ {group.suggested_value}
                    </p>
                )}
            </div>

            {notification && (
                <div className={`mb-6 p-4 rounded-lg text-center ${notification.type === 'success'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                    {notification.message}
                </div>
            )}

            <Card className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-primary">Status do Grupo</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${group.is_drawn ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {group.is_drawn ? '✓ Sorteio realizado' : '⏳ Aguardando sorteio'}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-3xl font-bold text-primary">{totalCount}</p>
                        <p className="text-sm text-text-muted">Participantes</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-3xl font-bold text-secondary">{viewedCount}/{totalCount}</p>
                        <p className="text-sm text-text-muted">Viram o resultado</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">{wishlistCount}/{totalCount}</p>
                        <p className="text-sm text-text-muted">Lista de desejos</p>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-primary">Participantes</h2>
                    <Button
                        onClick={sendToAll}
                        isLoading={sendingAll}
                        className="text-sm"
                    >
                        {sendingAll ? 'Enviando...' : '📱 Enviar para todos'}
                    </Button>
                </div>

                <div className="flex flex-col gap-3">
                    {group.participants.map((p) => (
                        <div
                            key={p.id}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${p.has_viewed_result
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-border'
                                }`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-text">{p.name}</p>
                                    {p.has_viewed_result && (
                                        <span className="text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded-full">
                                            Visualizado ✓
                                        </span>
                                    )}
                                    {p.has_wishlist && (
                                        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">
                                            Lista 🎁
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-text-muted mt-1">
                                    Código: <code className="bg-gray-100 px-1 rounded">{p.access_code}</code>
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyCode(p.access_code, p.id)}
                                    className="text-sm text-gray-500 hover:text-primary transition-colors px-2 py-1"
                                    title="Copiar código"
                                >
                                    {copiedId === p.id ? '✓' : '📋'}
                                </button>
                                <button
                                    onClick={() => sendToParticipant(p)}
                                    disabled={sendingId === p.id}
                                    className="text-green-600 hover:text-green-700 font-semibold text-sm px-2 py-1 disabled:opacity-50"
                                    title="Enviar via WhatsApp"
                                >
                                    {sendingId === p.id ? '⏳' : '📱'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <p className="text-center text-xs text-text-muted mt-8">
                ⚠️ Você não pode ver quem tirou quem para manter o sigilo do sorteio.
            </p>
        </div>
    );
}
