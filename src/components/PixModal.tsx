'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface PixModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY || '27997418240';

const formatPhoneNumber = (phone: string): string => {
    // Format: (27) 99741-8240
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
};

export const PixModal: React.FC<PixModalProps> = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);
    const formattedPhone = formatPhoneNumber(PIX_KEY);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(PIX_KEY);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 pt-12 text-center">
                {/* Header */}
                <div className="mb-6">
                    <div className="text-5xl mb-4 animate-wiggle inline-block">☕</div>
                    <h2 className="text-2xl font-bold text-primary mb-2">
                        Gostou do App?
                    </h2>
                    <p className="text-text-muted text-sm leading-relaxed">
                        Se esse app facilitou seu Amigo Secreto, considere pagar um café para o desenvolvedor!
                        <span className="text-secondary font-medium"> Qualquer valor é muito bem-vindo! 💛</span>
                    </p>
                </div>

                {/* QR Code */}
                <div className="bg-gradient-to-br from-[#FEF3C7] to-white p-4 rounded-xl mb-6 inline-block shadow-inner border border-border">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <Image
                            src="/qr-code-pix.jpg"
                            alt="QR Code PIX"
                            width={200}
                            height={200}
                            className="rounded-md"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        📱 Escaneie com o app do seu banco
                    </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="text-xs text-gray-400 font-medium">OU COPIE A CHAVE</span>
                    <div className="flex-1 h-px bg-border"></div>
                </div>

                {/* Copy Key Section */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-border">
                    <p className="text-xs text-gray-500 mb-2">Chave PIX (Celular)</p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-lg font-mono font-semibold text-text">
                            {formattedPhone}
                        </span>
                    </div>
                    <Button
                        onClick={handleCopy}
                        variant="primary"
                        className="mt-4 w-full"
                    >
                        {copied ? (
                            <span className="flex items-center justify-center gap-2">
                                ✓ Copiado!
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                📋 Copiar Chave PIX
                            </span>
                        )}
                    </Button>
                </div>

                {/* Footer */}
                <p className="text-xs text-gray-400">
                    Obrigado por usar o Amigo Secreto! 🎁
                </p>
            </div>
        </Modal>
    );
};
