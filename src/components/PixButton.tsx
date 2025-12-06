'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PixModal } from '@/components/PixModal';

export function PixButton() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <Button
                variant="secondary"
                className="text-sm py-2 px-4"
                onClick={() => setShowModal(true)}
            >
                ☕ Pague um café (Pix)
            </Button>
            <PixModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    );
}
