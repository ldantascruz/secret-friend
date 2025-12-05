// Evolution API Service for WhatsApp messaging
// Documentation: https://doc.evolution-api.com/

// Remove trailing slashes and ensure clean base URL
const rawUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_URL = rawUrl.replace(/\/+$/, ''); // Remove trailing slashes
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || 'main';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';

console.log('Evolution API Config:', {
    url: EVOLUTION_API_URL,
    instance: EVOLUTION_INSTANCE,
    hasKey: !!EVOLUTION_API_KEY
});

export interface SendMessageParams {
    phone: string;
    message: string;
}

export interface SendMessageResult {
    success: boolean;
    error?: string;
}

/**
 * Formats a Brazilian phone number to the WhatsApp format (5527999999999)
 */
function formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // Add country code if not present
    if (!cleaned.startsWith('55')) {
        cleaned = '55' + cleaned;
    }

    return cleaned;
}

/**
 * Sends a WhatsApp message using Evolution API
 */
export async function sendWhatsAppMessage({ phone, message }: SendMessageParams): Promise<SendMessageResult> {
    const formattedPhone = formatPhoneNumber(phone);

    try {
        const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY,
            },
            body: JSON.stringify({
                number: formattedPhone,
                text: message,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Evolution API error:', errorData);
            return {
                success: false,
                error: errorData.message || `HTTP ${response.status}`
            };
        }

        const data = await response.json();
        console.log('Message sent successfully:', data);
        return { success: true };
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Sends WhatsApp messages to multiple recipients
 */
export async function sendBulkWhatsAppMessages(
    messages: SendMessageParams[]
): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = {
        sent: 0,
        failed: 0,
        errors: [] as string[],
    };

    for (const msg of messages) {
        const result = await sendWhatsAppMessage(msg);

        if (result.success) {
            results.sent++;
        } else {
            results.failed++;
            results.errors.push(`${msg.phone}: ${result.error}`);
        }

        // Delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
}

/**
 * Checks if Evolution API is configured and available
 */
export async function checkEvolutionApiStatus(): Promise<boolean> {
    if (!EVOLUTION_API_KEY) {
        console.log('Evolution API not configured (missing API key)');
        return false;
    }

    try {
        const response = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
            headers: {
                'apikey': EVOLUTION_API_KEY,
            },
        });

        return response.ok;
    } catch (error) {
        console.error('Evolution API health check failed:', error);
        return false;
    }
}
