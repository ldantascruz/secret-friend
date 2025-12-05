export interface Participant {
    id: string;
    name: string;
}

export interface DrawResult {
    odId: string;       // quem tirou
    tookId: string;   // quem foi tirado
}

export function performSecretSantaDraw(participants: Participant[]): DrawResult[] {
    if (participants.length < 2) {
        throw new Error('Mínimo de 2 participantes necessário');
    }

    // Embaralha usando Fisher-Yates
    const shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Cria um ciclo: cada pessoa tira a próxima na lista embaralhada
    // A última pessoa tira a primeira (fecha o ciclo)
    const results: DrawResult[] = shuffled.map((participant, index) => {
        const nextIndex = (index + 1) % shuffled.length;
        return {
            odId: participant.id,
            tookId: shuffled[nextIndex].id,
        };
    });

    return results;
}
