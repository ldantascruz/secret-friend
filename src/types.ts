export interface Group {
    id: string;
    code: string;
    name: string;
    suggested_value?: number;
    event_date?: string;
    organizer_phone?: string;
    is_drawn: boolean;
    created_at: string;
    participants?: Participant[];
    notifications?: {
        sent: number;
        failed: number;
        errors?: string[];
    };
}

export interface Participant {
    id: string;
    group_id: string;
    name: string;
    phone?: string;
    access_code: string;
    drawn_participant_id?: string;
    has_viewed_result: boolean;
}

export interface CreateGroupInput {
    name: string;
    suggested_value?: string; // Input as string, convert to number
    event_date?: string;
    organizer_phone?: string;
}

export interface AddParticipantInput {
    name: string;
    phone?: string;
}
