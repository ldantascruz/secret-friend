'use server'

import { supabase } from '@/lib/supabase';
import { performSecretSantaDraw } from '@/lib/draw';
import { CreateGroupInput, AddParticipantInput } from '@/types';

// Helper to generate a random code
function generateCode(length: number = 8): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function createGroup(data: CreateGroupInput) {
    const code = generateCode(6); // Short code for group

    const { data: group, error } = await supabase
        .from('groups')
        .insert({
            name: data.name,
            suggested_value: data.suggested_value ? parseFloat(data.suggested_value) : null,
            event_date: data.event_date || null,
            organizer_name: data.organizer_name,
            organizer_phone: data.organizer_phone,
            code: code
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating group:', error);
        throw new Error('Failed to create group');
    }

    return group;
}

export async function addParticipants(groupId: string, participants: AddParticipantInput[]) {
    const participantsWithCodes = participants.map(p => ({
        group_id: groupId,
        name: p.name,
        phone: p.phone,
        access_code: generateCode(8) // Unique access code for each participant
    }));

    const { data, error } = await supabase
        .from('participants')
        .insert(participantsWithCodes)
        .select();

    if (error) {
        console.error('Error adding participants:', error);
        throw new Error('Failed to add participants');
    }

    return data;
}

export async function executeDraw(groupId: string) {
    // Import Evolution API dynamically to avoid client-side issues
    const { sendBulkWhatsAppMessages, sendWhatsAppMessage, checkEvolutionApiStatus } = await import('@/lib/evolution-api');

    // 1. Fetch participants
    const { data: participants, error: fetchError } = await supabase
        .from('participants')
        .select('*')
        .eq('group_id', groupId);

    if (fetchError || !participants) {
        throw new Error('Failed to fetch participants');
    }

    if (participants.length < 2) {
        throw new Error('Need at least 2 participants to draw');
    }

    // 2. Fetch group info for the message (including organizer info)
    const { data: group } = await supabase
        .from('groups')
        .select('name, code, organizer_name, organizer_phone')
        .eq('id', groupId)
        .single();

    // 3. Perform draw
    const results = performSecretSantaDraw(participants);

    // 4. Update participants with their match
    const updates = results.map(result =>
        supabase
            .from('participants')
            .update({ drawn_participant_id: result.tookId })
            .eq('id', result.odId)
    );

    await Promise.all(updates);

    // 5. Mark group as drawn
    await supabase
        .from('groups')
        .update({ is_drawn: true })
        .eq('id', groupId);

    // 6. Send WhatsApp notifications automatically (if Evolution API is configured)
    let notificationResult = { sent: 0, failed: 0, errors: [] as string[] };

    const isApiAvailable = await checkEvolutionApiStatus();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (isApiAvailable && group) {
        // Send participant notifications with link AND code
        const messages = participants.map(p => ({
            phone: p.phone || '',
            message: `Olá ${p.name}! 🎄

Você está participando do Amigo Secreto "${group.name}"!

Clique no link abaixo para descobrir quem você tirou:
👉 ${baseUrl}/p/${p.access_code}

Seu código de acesso: *${p.access_code}*
Este link é pessoal e intransferível. Não compartilhe com ninguém! 🤫`
        })).filter(m => m.phone);

        notificationResult = await sendBulkWhatsAppMessages(messages);
        console.log('WhatsApp notifications sent:', notificationResult);

        // 7. Send admin notification to organizer
        if (group.organizer_phone) {
            const adminMessage = `📊 ${group.organizer_name || 'Organizador'}, o sorteio foi realizado! 🎉

O Amigo Secreto "${group.name}" foi sorteado com sucesso!

📋 Acesse o painel de administração:
👉 ${baseUrl}/admin/${group.code}

Código do grupo: *${group.code}*

Use o link acima para acompanhar quem já viu o resultado e reenviar notificações se necessário.`;

            try {
                await sendWhatsAppMessage({
                    phone: group.organizer_phone,
                    message: adminMessage
                });
                console.log('Admin notification sent to organizer:', group.organizer_name);
            } catch (error) {
                console.error('Failed to send admin notification:', error);
            }
        }
    }

    return {
        success: true,
        participants: participants,
        notifications: notificationResult
    };
}

export async function loginParticipant(groupCode: string, name: string) {
    // 1. Find group
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('code', groupCode.toUpperCase())
        .single();

    if (groupError || !group) {
        throw new Error('Group not found');
    }

    // 2. Find participant
    // We use ILIKE for case-insensitive name matching
    const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('access_code')
        .eq('group_id', group.id)
        .ilike('name', name)
        .single();

    if (participantError || !participant) {
        throw new Error('Participant not found in this group');
    }

    return participant.access_code;
}

export async function getParticipantData(accessCode: string) {
    const { data: participant, error } = await supabase
        .from('participants')
        .select(`
      *,
      group:groups (
        name,
        suggested_value,
        event_date,
        is_drawn
      ),
      drawn_person:participants!drawn_participant_id (
        name,
        wishes (
          description,
          position
        )
      ),
      wishes (
        description,
        position
      )
    `)
        .eq('access_code', accessCode)
        .single();

    if (error) {
        console.error('Error fetching participant:', error);
        return null;
    }

    console.log('getParticipantData result:', JSON.stringify(participant, null, 2));

    return participant;
}

export async function updateWishes(participantId: string, wishes: string[]) {
    const { sendWhatsAppMessage, checkEvolutionApiStatus } = await import('@/lib/evolution-api');

    // Delete existing wishes
    await supabase
        .from('wishes')
        .delete()
        .eq('participant_id', participantId);

    // Insert new wishes
    const wishesToInsert = wishes
        .filter(w => w.trim() !== '')
        .map((w, index) => ({
            participant_id: participantId,
            description: w,
            position: index + 1
        }));

    if (wishesToInsert.length > 0) {
        const { error } = await supabase
            .from('wishes')
            .insert(wishesToInsert);

        if (error) throw new Error('Failed to update wishes');
    }

    // Notify the person who drew this participant
    try {
        const isApiAvailable = await checkEvolutionApiStatus();
        if (!isApiAvailable || wishesToInsert.length === 0) return;

        // Get this participant's info and group
        const { data: thisParticipant } = await supabase
            .from('participants')
            .select(`
                name,
                group_id,
                group:groups (name)
            `)
            .eq('id', participantId)
            .single();

        if (!thisParticipant) return;

        // Find who drew this participant (drawn_participant_id = this participant)
        const { data: whoDrawMe } = await supabase
            .from('participants')
            .select('name, phone, access_code')
            .eq('group_id', thisParticipant.group_id)
            .eq('drawn_participant_id', participantId)
            .single();

        if (!whoDrawMe || !whoDrawMe.phone) return;

        const groupName = Array.isArray(thisParticipant.group)
            ? thisParticipant.group[0]?.name
            : (thisParticipant.group as any)?.name || 'Amigo Secreto';

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const message = `🎁 Boa notícia, ${whoDrawMe.name}!

${thisParticipant.name} acabou de atualizar a lista de desejos no Amigo Secreto "${groupName}"!

Acesse o link para ver as sugestões:
👉 ${baseUrl}/p/${whoDrawMe.access_code}

Agora ficou mais fácil escolher o presente! 🎄`;

        await sendWhatsAppMessage({
            phone: whoDrawMe.phone,
            message
        });

        console.log(`Wishlist notification sent to ${whoDrawMe.name} about ${thisParticipant.name}'s updated wishlist`);
    } catch (error) {
        // Don't fail the wish update if notification fails
        console.error('Failed to send wishlist update notification:', error);
    }
}

export async function markAsViewed(participantId: string) {
    await supabase
        .from('participants')
        .update({ has_viewed_result: true })
        .eq('id', participantId);
}

export async function getGroupAdmin(groupCode: string) {
    // Fetch group by code
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('code', groupCode.toUpperCase())
        .single();

    if (groupError || !group) {
        return null;
    }

    // Fetch participants with their wishes (to show who filled wishlist)
    const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select(`
            id, 
            name, 
            phone, 
            access_code, 
            has_viewed_result,
            wishes (id)
        `)
        .eq('group_id', group.id)
        .order('name');

    if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        return null;
    }

    // Transform wishes array to has_wishlist boolean
    const participantsWithWishlistStatus = participants?.map(p => ({
        ...p,
        has_wishlist: Array.isArray(p.wishes) && p.wishes.length > 0,
        wishes: undefined // Remove the wishes array itself
    })) || [];

    return {
        ...group,
        participants: participantsWithWishlistStatus
    };
}

// Send WhatsApp notification to a single participant via Evolution API
export async function sendNotificationToParticipant(
    participantId: string,
    groupName: string,
    groupCode: string
) {
    const { sendWhatsAppMessage } = await import('@/lib/evolution-api');

    // Fetch participant
    const { data: participant, error } = await supabase
        .from('participants')
        .select('name, phone, access_code')
        .eq('id', participantId)
        .single();

    if (error || !participant || !participant.phone) {
        return { success: false, error: 'Participante não encontrado ou sem telefone' };
    }

    const message = `Olá ${participant.name}! 🎄

Você está participando do Amigo Secreto "${groupName}"!

Clique no link abaixo para descobrir quem você tirou:
👉 ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/p/${participant.access_code}

Este link é pessoal e intransferível. Não compartilhe com ninguém! 🤫`;

    const result = await sendWhatsAppMessage({
        phone: participant.phone,
        message
    });

    return result;
}

// Send WhatsApp notifications to all participants in a group via Evolution API
export async function sendNotificationsToAllParticipants(groupCode: string) {
    const { sendBulkWhatsAppMessages } = await import('@/lib/evolution-api');

    // Fetch group
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id, name, code')
        .eq('code', groupCode.toUpperCase())
        .single();

    if (groupError || !group) {
        return { success: false, sent: 0, failed: 0, error: 'Grupo não encontrado' };
    }

    // Fetch participants
    const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('name, phone, access_code')
        .eq('group_id', group.id);

    if (participantsError || !participants) {
        return { success: false, sent: 0, failed: 0, error: 'Erro ao buscar participantes' };
    }

    const messages = participants
        .filter(p => p.phone)
        .map(p => ({
            phone: p.phone!,
            message: `Olá ${p.name}! 🎄

Você está participando do Amigo Secreto "${group.name}"!

Clique no link abaixo para descobrir quem você tirou:
👉 ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/p/${p.access_code}

Este link é pessoal e intransferível. Não compartilhe com ninguém! 🤫`
        }));

    const result = await sendBulkWhatsAppMessages(messages);

    return {
        success: result.failed === 0,
        sent: result.sent,
        failed: result.failed,
        errors: result.errors
    };
}
