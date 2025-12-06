import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PixButton } from '@/components/PixButton';

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-br from-background to-[#FFFBEB] overflow-hidden">
            <div className="max-w-[600px] mb-12 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

                <span className="text-6xl mb-4 block animate-float cursor-default hover:animate-wiggle transition-all">🎁</span>
                <h1 className="text-4xl md:text-5xl mb-4 text-primary font-bold leading-tight animate-fade-in-up [animation-delay:200ms] opacity-0">Organize seu Amigo Secreto em segundos</h1>
                <p className="text-xl text-text-muted mb-10 animate-fade-in-up [animation-delay:400ms] opacity-0">
                    Sem cadastro, sem app, sem complicação. Crie grupos, sorteie e compartilhe.
                </p>

                {/* Main Action */}
                <div className="animate-fade-in-up [animation-delay:600ms] opacity-0 mb-8">
                    <Link href="/create" className="block transform transition-all hover:scale-105 active:scale-95">
                        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all">
                            <div className="text-3xl mb-2">✨</div>
                            <h2 className="text-xl font-bold mb-1 !text-white">Criar Novo Sorteio</h2>
                            <p className="text-sm opacity-90">Comece agora, é grátis!</p>
                        </div>
                    </Link>
                </div>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-4 animate-fade-in-up [animation-delay:800ms] opacity-0">
                    <Link href="/access" className="block transform transition-all hover:scale-105 active:scale-95">
                        <div className="bg-white border-2 border-border p-5 rounded-xl shadow-md hover:shadow-lg hover:border-primary/30 transition-all h-full">
                            <div className="text-2xl mb-2">🎯</div>
                            <h3 className="font-bold text-text mb-1">Participante</h3>
                            <p className="text-xs text-text-muted">Tenho um código de acesso</p>
                        </div>
                    </Link>

                    <Link href="/admin-access" className="block transform transition-all hover:scale-105 active:scale-95">
                        <div className="bg-white border-2 border-border p-5 rounded-xl shadow-md hover:shadow-lg hover:border-secondary/30 transition-all h-full">
                            <div className="text-2xl mb-2">👑</div>
                            <h3 className="font-bold text-text mb-1">Organizador</h3>
                            <p className="text-xs text-text-muted">Gerenciar meu grupo</p>
                        </div>
                    </Link>
                </div>
            </div>

            <footer className="mt-16 text-sm text-text-muted animate-fade-in [animation-delay:1000ms] opacity-0">
                <p>Feito com ❤️ para o seu Natal</p>
                <div className="mt-4">
                    <PixButton />
                </div>
            </footer>
        </main>
    );
}
