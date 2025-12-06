'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { createGroup, addParticipants, executeDraw } from '@/app/actions';
import { CreateGroupInput, AddParticipantInput, Group } from '@/types';
import { maskPhone, validatePhone } from '@/utils/masks';

export default function CreateGroupForm() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Step 1 Data
    const [groupData, setGroupData] = useState<CreateGroupInput>({
        name: '',
        suggested_value: '',
        event_date: '',
        organizer_name: '',
        organizer_phone: ''
    });
    const [createdGroup, setCreatedGroup] = useState<Group | null>(null);

    // Step 2 Data
    const [organizerParticipates, setOrganizerParticipates] = useState(true);
    const [participants, setParticipants] = useState<AddParticipantInput[]>([]);
    const [newParticipant, setNewParticipant] = useState<AddParticipantInput>({ name: '', phone: '' });
    const [participantError, setParticipantError] = useState('');

    // Add organizer as first participant when entering step 2
    useEffect(() => {
        if (step === 2 && organizerParticipates && participants.length === 0) {
            setParticipants([{
                name: groupData.organizer_name,
                phone: groupData.organizer_phone
            }]);
        }
    }, [step]);

    // Handle organizer participation toggle
    const handleOrganizerParticipateToggle = (checked: boolean) => {
        setOrganizerParticipates(checked);
        if (checked) {
            // Add organizer as first participant if not already there
            const isOrganizerInList = participants.some(
                p => p.phone === groupData.organizer_phone
            );
            if (!isOrganizerInList) {
                setParticipants([{
                    name: groupData.organizer_name,
                    phone: groupData.organizer_phone
                }, ...participants]);
            }
        } else {
            // Remove organizer from list
            setParticipants(participants.filter(
                p => p.phone !== groupData.organizer_phone
            ));
        }
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!groupData.organizer_name.trim()) {
            alert('Nome do organizador é obrigatório.');
            return;
        }

        if (!validatePhone(groupData.organizer_phone)) {
            alert('WhatsApp do organizador inválido.');
            return;
        }

        setIsLoading(true);
        try {
            const group = await createGroup(groupData);
            setCreatedGroup(group);
            setStep(2);
        } catch (error) {
            alert('Erro ao criar grupo. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddParticipant = (e: React.FormEvent) => {
        e.preventDefault();
        setParticipantError('');

        if (!newParticipant.name.trim()) {
            setParticipantError('Nome é obrigatório');
            return;
        }

        if (!newParticipant.phone || !validatePhone(newParticipant.phone)) {
            setParticipantError('WhatsApp válido é obrigatório');
            return;
        }

        // Check for duplicate phone
        if (participants.some(p => p.phone === newParticipant.phone)) {
            setParticipantError('Este WhatsApp já foi adicionado');
            return;
        }

        setParticipants([...participants, newParticipant]);
        setNewParticipant({ name: '', phone: '' });
    };

    const removeParticipant = (index: number) => {
        const participant = participants[index];
        // If removing organizer, uncheck the toggle
        if (participant.phone === groupData.organizer_phone) {
            setOrganizerParticipates(false);
        }
        setParticipants(participants.filter((_, i) => i !== index));
    };

    const handleSaveParticipants = async () => {
        if (participants.length < 2) {
            alert('Adicione pelo menos 2 participantes.');
            return;
        }
        if (!createdGroup) return;

        setIsLoading(true);
        try {
            await addParticipants(createdGroup.id, participants);
            setStep(3);
        } catch (error) {
            alert('Erro ao salvar participantes.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDraw = async () => {
        if (!createdGroup) return;
        setIsLoading(true);
        try {
            const result = await executeDraw(createdGroup.id);
            if (result.participants) {
                setCreatedGroup({ ...createdGroup, participants: result.participants });
            }
            setStep(4);
        } catch (error) {
            alert('Erro ao realizar sorteio.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyLink = () => {
        const link = `${window.location.origin}/access`;
        navigator.clipboard.writeText(`Acesse seu amigo secreto: ${link} \nCódigo do grupo: ${createdGroup?.code}`);
        alert('Link copiado!');
    };

    const isOrganizerParticipant = (phone?: string) => {
        return phone === groupData.organizer_phone;
    };

    return (
        <div className="max-w-[600px] mx-auto py-8 px-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary mb-4">Criar Novo Sorteio</h1>
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors
                ${step === s ? 'bg-primary text-white' : ''}
                ${step > s ? 'bg-secondary text-white' : ''}
                ${step < s ? 'bg-border text-text-muted' : ''}
              `}
                        >
                            {s}
                        </div>
                    ))}
                </div>
            </div>

            <Card className="animate-fade-in-up">
                {step === 1 && (
                    <form onSubmit={handleCreateGroup} className="flex flex-col gap-6 animate-slide-in">
                        <h2 className="text-xl font-bold text-primary">Detalhes do Grupo</h2>
                        <Input
                            label="Nome do Grupo"
                            placeholder="Ex: Família Silva 2024"
                            value={groupData.name}
                            onChange={e => setGroupData({ ...groupData, name: e.target.value })}
                            required
                            className="transition-all focus:scale-[1.01]"
                        />
                        <Input
                            label="Valor Sugerido (R$)"
                            placeholder="Ex: 50.00"
                            type="number"
                            value={groupData.suggested_value}
                            onChange={e => setGroupData({ ...groupData, suggested_value: e.target.value })}
                            className="transition-all focus:scale-[1.01]"
                        />
                        <Input
                            label="Data do Evento"
                            type="date"
                            value={groupData.event_date}
                            onChange={e => setGroupData({ ...groupData, event_date: e.target.value })}
                            className="transition-all focus:scale-[1.01]"
                        />

                        <div className="border-t border-border pt-6 mt-2">
                            <h3 className="text-lg font-semibold text-primary mb-4">👤 Dados do Organizador</h3>
                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Seu Nome"
                                    placeholder="Ex: João Silva"
                                    value={groupData.organizer_name}
                                    onChange={e => setGroupData({ ...groupData, organizer_name: e.target.value })}
                                    required
                                    className="transition-all focus:scale-[1.01]"
                                />
                                <Input
                                    label="Seu WhatsApp"
                                    placeholder="(00) 00000-0000"
                                    value={groupData.organizer_phone}
                                    onChange={e => setGroupData({ ...groupData, organizer_phone: maskPhone(e.target.value) })}
                                    maxLength={15}
                                    required
                                    className="transition-all focus:scale-[1.01]"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                Você receberá o link de administração do grupo por WhatsApp.
                            </p>
                        </div>

                        <Button type="submit" fullWidth isLoading={isLoading} className="mt-2">
                            Próximo: Adicionar Participantes
                        </Button>
                    </form>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-6 animate-slide-in">
                        <h2 className="text-xl font-bold text-primary">Participantes ({participants.length})</h2>

                        {/* Organizer participation toggle */}
                        <label className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                            <input
                                type="checkbox"
                                checked={organizerParticipates}
                                onChange={(e) => handleOrganizerParticipateToggle(e.target.checked)}
                                className="w-5 h-5 accent-primary"
                            />
                            <div>
                                <p className="font-medium text-blue-900">Eu também sou participante</p>
                                <p className="text-sm text-blue-700">
                                    {groupData.organizer_name} participará do sorteio
                                </p>
                            </div>
                        </label>

                        <div className="flex flex-col gap-3 mb-6">
                            {participants.map((p, i) => (
                                <div key={i} className={`flex justify-between items-center p-3 rounded-md border animate-pop-in ${isOrganizerParticipant(p.phone)
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-gray-50 border-border'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        <strong>{p.name}</strong>
                                        {isOrganizerParticipant(p.phone) && (
                                            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                                                Organizador
                                            </span>
                                        )}
                                        {p.phone && <span className="ml-2 text-gray-500">{p.phone}</span>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeParticipant(i)}
                                        className="text-red-500 hover:text-red-700 text-xl p-1 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            {participants.length === 0 && (
                                <p className="text-center text-gray-400 py-4">Nenhum participante adicionado.</p>
                            )}
                        </div>

                        <form onSubmit={handleAddParticipant} className="flex flex-col gap-2 mb-4">
                            <div className="flex gap-2 items-end">
                                <div className="flex-[2]">
                                    <Input
                                        placeholder="Nome"
                                        value={newParticipant.name}
                                        onChange={e => setNewParticipant({ ...newParticipant, name: e.target.value })}
                                        error={participantError && !newParticipant.name ? 'Obrigatório' : ''}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Input
                                        placeholder="WhatsApp"
                                        value={newParticipant.phone}
                                        onChange={e => setNewParticipant({ ...newParticipant, phone: maskPhone(e.target.value) })}
                                        maxLength={15}
                                        error={participantError && !newParticipant.phone ? 'Obrigatório' : ''}
                                    />
                                </div>
                                <Button type="submit" variant="secondary" className="h-[50px]">+</Button>
                            </div>
                            {participantError && <p className="text-red-500 text-sm">{participantError}</p>}
                        </form>

                        <Button onClick={handleSaveParticipants} fullWidth isLoading={isLoading} disabled={participants.length < 2}>
                            Próximo: Revisar e Sortear
                        </Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-6 animate-slide-in">
                        <h2 className="text-xl font-bold text-primary">Revisão</h2>
                        <div className="bg-[#FFFBEB] p-6 rounded-md border border-[#FCD34D] mb-6 shadow-sm">
                            <div className="flex justify-between mb-2">
                                <strong>Grupo:</strong> <span>{createdGroup?.name}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <strong>Organizador:</strong> <span>{groupData.organizer_name}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <strong>Participantes:</strong> <span>{participants.length}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <strong>Valor:</strong> <span>R$ {createdGroup?.suggested_value || '0,00'}</span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            ⚠️ Ao clicar em sortear, os pares serão definidos e não poderão ser alterados.
                        </p>

                        <Button onClick={handleDraw} fullWidth isLoading={isLoading} className="text-lg py-4">
                            🎄 Realizar Sorteio
                        </Button>
                    </div>
                )}

                {step === 4 && (
                    <div className="text-center p-8 animate-pop-in">
                        <div className="text-6xl mb-6 animate-bounce">🎉</div>
                        <h2 className="text-2xl font-bold text-primary mb-4">Sorteio Realizado!</h2>

                        {createdGroup?.notifications && createdGroup.notifications.sent > 0 ? (
                            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
                                ✅ {createdGroup.notifications.sent} mensagens enviadas automaticamente via WhatsApp!
                            </div>
                        ) : (
                            <p className="mb-6 text-text-muted">
                                Os participantes receberão seus códigos via WhatsApp.
                            </p>
                        )}

                        <div className="flex flex-col gap-3 mb-8 max-h-[300px] overflow-y-auto">
                            {createdGroup?.participants?.map((p: any) => (
                                <div key={p.id} className={`flex items-center justify-between p-3 border rounded-md shadow-sm ${isOrganizerParticipant(p.phone)
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-white border-border'
                                    }`}>
                                    <div className="text-left">
                                        <p className="font-bold text-text flex items-center gap-2">
                                            {p.name}
                                            {isOrganizerParticipant(p.phone) && (
                                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                                                    Organizador
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-text-muted">Código: <code className="bg-gray-100 px-1 rounded">{p.access_code}</code></p>
                                    </div>
                                    <span className="text-green-600 text-sm">✓ Notificado</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button onClick={() => router.push(`/admin/${createdGroup?.code}`)} fullWidth>
                                📊 Gerenciar Grupo
                            </Button>
                            <Button onClick={() => router.push('/')} variant="secondary" fullWidth>
                                Voltar ao Início
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
