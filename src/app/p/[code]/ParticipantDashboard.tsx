'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { updateWishes, markAsViewed } from '@/app/actions';

interface Props {
    participant: any; // Using any for simplicity with the complex join type
}

export default function ParticipantDashboard({ participant }: Props) {
    const [isRevealed, setIsRevealed] = useState(participant.has_viewed_result);
    const [wishes, setWishes] = useState<string[]>(
        participant.wishes?.map((w: any) => w.description) || ['', '', '']
    );
    const [isSaving, setIsSaving] = useState(false);

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
            alert('Lista de desejos salva!');
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

    return (
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

                        {drawnPerson?.wishes && drawnPerson.wishes.length > 0 ? (
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
                            <p className="mt-4 text-gray-500 italic bg-gray-50 p-4 rounded-md">
                                {drawnPerson?.name} ainda não cadastrou sugestões de presente.
                            </p>
                        )}
                    </div>
                )}
            </Card>

            <Card className="mt-8 animate-fade-in-up [animation-delay:200ms] opacity-0">
                <h2 className="text-xl font-bold mb-4">Sua Lista de Desejos</h2>
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
            </Card>
        </div>
    );
}
