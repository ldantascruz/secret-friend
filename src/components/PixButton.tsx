'use client'

import { Button } from '@/components/ui/Button';

export function PixButton() {
    return (
        <Button
            variant="secondary"
            className="text-sm py-2 px-4"
            onClick={() => alert('Chave Pix: seu-email@exemplo.com')}
        >
            ☕ Pague um café (Pix)
        </Button>
    );
}
