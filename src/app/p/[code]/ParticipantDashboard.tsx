'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PixModal } from '@/components/PixModal';
import { updateWishes, markAsViewed } from '@/app/actions';

interface Props {
    participant: any; // Using any for simplicity with the complex join type
}

export default function ParticipantDashboard({ participant }: Props) {
    const [isRevealed, setIsRevealed] = useState(participant.has_viewed_result);
    const [showPixModal, setShowPixModal] = useState(false);
    const [hasShownPixModal, setHasShownPixModal] = useState(false);
    const [wishes, setWishes] = useState<string[]>(
        participant.wishes?.map((w: any) => w.description) || ['', '', '']
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(
        !participant.wishes || participant.wishes.length === 0
    );
    const [isSaved, setIsSaved] = useState(
        participant.wishes && participant.wishes.length > 0
    );
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Show modal after 8 seconds of viewing the result (only once)
    useEffect(() => {
        if (isRevealed && !hasShownPixModal && !participant.has_viewed_result) {
            timerRef.current = setTimeout(() => {
                setShowPixModal(true);
                setHasShownPixModal(true);
            }, 8000); // 8 seconds delay
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isRevealed, hasShownPixModal, participant.has_viewed_result]);

    // Ensure 3 slots
    while (wishes.length < 3) wishes.push('');

    const handleReveal = async () => {
        setIsRevealed(true);
        if (!participant.has_viewed_result) {
            await markAsViewed(participant.id);
        }
    };

    const handleSaveWishes = async () => {
        setIsSaving(true);
        try {
            await updateWishes(participant.id, wishes);
            setIsSaved(true);
            setIsEditing(false);
            // Show Pix modal after saving wishes as a thank-you moment
            if (!hasShownPixModal) {
                setShowPixModal(true);
                setHasShownPixModal(true);
            }
        } catch (error) {
            alert('Erro ao salvar lista de desejos.');
        } finally {
            setIsSaving(false);
        }
    };

    const updateWish = (index: number, value: string) => {
        const newWishes = [...wishes];
        newWishes[index] = value;
        setWishes(newWishes);
    };

    // drawn_person comes as an array from the Supabase join
    const drawnPerson = Array.isArray(participant.drawn_person)
        ? participant.drawn_person[0]
        : participant.drawn_person;

    const drawnPersonHasWishes = drawnPerson?.wishes && drawnPerson.wishes.length > 0;
    const myFilledWishes = wishes.filter(w => w.trim() !== '');

    return (
        <>
            <PixModal isOpen={showPixModal} onClose={() => setShowPixModal(false)} />

            <div className="max-w-[600px] mx-auto py-8 px-4">
                <div className="text-center mb-8">
                    <p className="text-xl text-text-muted">Olá, <strong>{participant.name}</strong>!</p>
                    <h1 className="text-2xl font-bold text-primary mt-2">{participant.group.name}</h1>
                    {participant.group.event_date && (
                        <p className="text-sm text-gray-500 mt-2">
                            Data do evento: {new Date(participant.group.event_date).toISOString().split('T')[0]}
                        </p>
                    )}
                    {participant.group.suggested_value && (
                        <p className="text-sm text-gray-500">
                            Valor sugerido: R$ {participant.group.suggested_value}
                        </p>
                    )}
                </div>

                <Card className="text-center p-8 bg-gradient-to-br from-[#FEF3C7] to-white rounded-lg border-2 border-dashed border-secondary mb-8 shadow-lg transform transition-all hover:scale-[1.01]">
                    {!isRevealed ? (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-bold mb-4">Quem será seu amigo secreto?</h2>
                            <Button onClick={handleReveal} className="text-xl py-4 px-8 animate-pulse shadow-xl shadow-primary/20">
                                🎁 Revelar Agora
                            </Button>
                        </div>
                    ) : (
                        <div className="animate-pop-in">
                            <p className="text-text-muted">Você tirou:</p>
                            <div className="text-5xl font-extrabold text-primary my-6 drop-shadow-sm">{drawnPerson?.name}</div>

                            {/* Status da lista de desejos da pessoa que tirou */}
                            {drawnPersonHasWishes ? (
                                <div className="mt-8 text-left bg-white/50 p-4 rounded-lg">
                                    <h3 className="text-base font-bold mb-3 text-secondary flex items-center gap-2">
                                        <span>💡</span> Sugestões de presente:
                                    </h3>
                                    <ul className="list-none p-0 m-0">
                                        {drawnPerson.wishes.map((w: any, i: number) => (
                                            <li key={i} className="bg-white p-3 rounded-md mb-2 flex items-center shadow-sm border border-border/50 animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
                                                {w.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="mt-4 bg-orange-50 border border-orange-200 p-4 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 text-orange-600">
                                        <span className="text-xl">⏳</span>
                                        <p className="font-medium">
                                            {drawnPerson?.name} ainda não cadastrou sugestões de presente.
                                        </p>
                                    </div>
                                    <p className="text-sm text-orange-500 mt-2">
                                        Você receberá uma notificação no WhatsApp quando a lista for atualizada!
                                    </p>
                                </div>
                            )}

                            {/* Pix Donation Button */}
                            <button
                                onClick={() => setShowPixModal(true)}
                                className="mt-6 inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors bg-secondary/10 hover:bg-secondary/20 px-4 py-2 rounded-full"
                            >
                                ☕ Gostou? Pague um café para a nossa equipe!
                            </button>
                        </div>
                    )}
                </Card>

                <Card className="mt-8 animate-fade-in-up [animation-delay:200ms] opacity-0">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Sua Lista de Desejos</h2>
                        {isSaved && !isEditing && (
                            <span className="inline-flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                ✓ Salvo
                            </span>
                        )}
                    </div>

                    {isEditing ? (
                        <>
                            <p className="mb-6 text-sm text-gray-500">
                                Ajude seu amigo secreto! Diga o que você gostaria de ganhar.
                            </p>
                            <div className="flex flex-col gap-4">
                                {wishes.map((wish, i) => (
                                    <Input
                                        key={i}
                                        placeholder={`Opção ${i + 1}`}
                                        value={wish}
                                        onChange={(e) => updateWish(i, e.target.value)}
                                    />
                                ))}
                                <Button onClick={handleSaveWishes} isLoading={isSaving} variant="secondary">
                                    Salvar Minhas Sugestões
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            {myFilledWishes.length > 0 ? (
                                <div className="flex flex-col gap-3 mb-6">
                                    {myFilledWishes.map((wish, i) => (
                                        <div
                                            key={i}
                                            className="bg-gray-50 p-3 rounded-md border border-border/50 text-left flex items-center gap-2"
                                        >
                                            <span className="text-secondary">🎁</span>
                                            {wish}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mb-6 text-sm text-gray-500 italic">
                                    Você ainda não cadastrou nenhuma sugestão.
                                </p>
                            )}
                            <Button
                                onClick={() => setIsEditing(true)}
                                variant="secondary"
                                fullWidth
                            >
                                ✏️ Editar Lista de Desejos
                            </Button>
                        </>
                    )}
                </Card>
            </div>
        </>
    );
}
