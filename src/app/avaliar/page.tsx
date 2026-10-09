'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  AlertTriangle,
  ShieldCheck,
  Send,
  Loader2,
  MessageSquareWarning,
  ThumbsUp,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ATENDIMENTO', label: 'Atendimento', desc: 'Simpatia, acolhimento ou atenção' },
  { id: 'DEMORA', label: 'Tempo de Espera', desc: 'Fila ou agilidade no atendimento' },
  { id: 'QUALIDADE', label: 'Gelato / Sabor', desc: 'Consistência, sabor ou temperatura' },
  { id: 'PEDIDO_INCORRETO', label: 'Pedido Incorreto', desc: 'Sabor trocado ou item faltante' },
  { id: 'LIMPEZA', label: 'Limpeza da Loja', desc: 'Mesas, balcão ou instalações' },
  { id: 'AMBIENTE', label: 'Ambiente', desc: 'Música, climatização ou conforto' },
  { id: 'PAGAMENTO', label: 'Pagamento', desc: 'Cartão, troco ou caixa' },
  { id: 'OUTRO', label: 'Outro Motivo', desc: 'Outro detalhe da sua visita' },
];

function AvaliarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mesaParam = searchParams.get('mesa') || searchParams.get('token') || '';

  const [storeConfig, setStoreConfig] = useState<any>(null);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [tableError, setTableError] = useState<string | null>(null);

  // Form states
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');

  // Reclamação states (para notas 1, 2 e 3)
  const [category, setCategory] = useState<string>('ATENDIMENTO');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [contactPreference, setContactPreference] = useState<'WHATSAPP' | 'EMAIL' | 'TELEFONE' | 'NENHUM'>('WHATSAPP');
  const [requestContact, setRequestContact] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/public/configuracoes')
      .then((res) => res.json())
      .then((data) => setStoreConfig(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mesaParam) {
      fetch(`/api/public/mesa?mesa=${encodeURIComponent(mesaParam)}`)
        .then(async (res) => {
          const data = await res.json();
          if (res.ok && data.valid) {
            setTableInfo(data.table);
            setTableError(null);
          } else {
            setTableError(data.error || 'Mesa não identificada ou desativada.');
          }
        })
        .catch(() => {
          setTableError('Não foi possível verificar a mesa.');
        });
    }
  }, [mesaParam]);

  const isLowRating = rating > 0 && rating <= 3;
  const isHighRating = rating >= 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (rating === 0) {
      setErrorMessage('Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    if (isLowRating) {
      if (!description.trim() || description.trim().length < 5) {
        setErrorMessage('Por favor, descreva com pelo menos 5 caracteres o que podemos aprimorar.');
        return;
      }

      if (requestContact) {
        const hasPhone = customerPhone.trim().length >= 8;
        const hasEmail = customerEmail.trim().includes('@') && customerEmail.trim().length >= 5;
        if (!hasPhone && !hasEmail) {
          setErrorMessage('Para solicitar retorno da equipe Borelli, informe seu WhatsApp ou E-mail.');
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        rating,
        comment: isHighRating ? comment.trim() : '',
        tableToken: mesaParam || undefined,
      };

      if (isLowRating) {
        payload.complaint = {
          category,
          description: description.trim(),
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          customerEmail: customerEmail.trim() || undefined,
          contactPreference: requestContact ? contactPreference : 'NENHUM',
          requestContact,
        };
      }

      const res = await fetch('/api/public/avaliar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Erro ao enviar avaliação. Tente novamente.');
        setIsSubmitting(false);
        return;
      }

      router.push(`/sucesso?protocolo=${encodeURIComponent(data.protocol)}&nota=${rating}`);
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro de conexão com o servidor. Verifique sua internet.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#FAF7F0] py-4 sm:py-8 px-3 sm:px-6 flex flex-col items-center justify-start overflow-y-auto">
      <div className="max-w-xl w-full mx-auto bg-white rounded-3xl shadow-xl shadow-[#1E3A24]/5 border border-[#EAE3D2] overflow-hidden relative my-auto mb-8 sm:mb-12">
        {/* Faixa Tricolor Italiana */}
        <div className="h-1.5 flex w-full">
          <div className="w-1/3 bg-[#009246]" />
          <div className="w-1/3 bg-[#FFFFFF]" />
          <div className="w-1/3 bg-[#CE2B37]" />
        </div>

        {/* Top Header com a Logo Oficial da Gelato Borelli */}
        <header className="bg-[#1E3A24] text-[#FAF7F0] p-5 sm:p-8 text-center relative">
          <div className="mb-3 flex justify-center">
            <div className="p-2.5 bg-white/10 backdrop-blur rounded-2xl border border-white/15 inline-block shadow-inner">
              <img
                src="/logo-borelli.png"
                alt="Gelato Borelli"
                className="h-16 w-auto object-contain mx-auto"
              />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FAF7F0]">
            {storeConfig?.storeName || 'Gelato Borelli'}
          </h1>
          <p className="text-xs sm:text-sm text-[#D1DEC8] mt-1 max-w-md mx-auto">
            {storeConfig?.welcomeMessage || 'Como foi sua experiência na Gelato Borelli?'}
          </p>

          {/* Badge da Mesa */}
          {tableInfo && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 text-[#FAF7F0] border border-white/20 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>{tableInfo.name}</span>
            </div>
          )}

          {tableError && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>{tableError}</span>
            </div>
          )}
        </header>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pergunta e Estrelas */}
          <div className="text-center space-y-3">
            <label className="block text-sm sm:text-base font-bold text-[#1E3A24]">
              {storeConfig?.subtitleMessage || 'Sua opinião é fundamental para mantermos a excelência do nosso gelato!'}
            </label>
            <p className="text-xs text-[#6B756C]">Toque em uma estrela para avaliar de 1 a 5</p>

            <div className="flex items-center justify-center gap-2 pt-2">
              {[1, 2, 3, 4, 5].map((starNumber) => {
                const isFilled = (hoverRating || rating) >= starNumber;
                return (
                  <button
                    key={starNumber}
                    type="button"
                    onClick={() => {
                      setRating(starNumber);
                      setErrorMessage(null);
                    }}
                    onMouseEnter={() => setHoverRating(starNumber)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                    aria-label={`${starNumber} estrelas`}
                  >
                    <Star
                      className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                          : 'text-[#EAE3D2] fill-[#FAF7F0]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {rating > 0 && (
              <div className="text-sm font-bold pt-1">
                {rating === 5 && <span className="text-[#1E3A24]">Sabor Extraordinário! ⭐⭐⭐⭐⭐</span>}
                {rating === 4 && <span className="text-[#2C4C2F]">Muito Bom! ⭐⭐⭐⭐</span>}
                {rating === 3 && <span className="text-amber-600">Razoável ⭐⭐⭐</span>}
                {rating === 2 && <span className="text-rose-600">Abaixo do Esperado ⭐⭐</span>}
                {rating === 1 && <span className="text-rose-700">Insatisfeito ⭐</span>}
              </div>
            )}
          </div>

          {/* FLUXO POSITIVO (4 ou 5 estrelas) */}
          {isHighRating && (
            <div className="pt-4 border-t border-[#EAE3D2] space-y-4">
              <div className="flex items-center gap-2 text-[#1E3A24] bg-[#F4F7F4] p-3.5 rounded-2xl border border-[#CBD8CB] text-xs sm:text-sm">
                <ThumbsUp className="w-4 h-4 shrink-0 text-[#3F643E]" />
                <span className="font-semibold">Molto grazie! Conte-nos mais sobre seus sabores favoritos ou atendimento:</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A24] mb-1">
                  Deseja deixar um elogio ou comentário? (Opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Qual sabor você mais gostou? Pistache, Gianduia, Doce de Leite, Bacio..."
                  rows={3}
                  maxLength={1000}
                  className="w-full p-3.5 rounded-2xl border border-[#EAE3D2] bg-[#FAF7F0]/40 focus:border-[#1E3A24] focus:ring-2 focus:ring-[#1E3A24]/10 text-sm text-[#1E3A24] placeholder-slate-400 outline-none transition"
                />
              </div>
            </div>
          )}

          {/* FLUXO DE OUVIDORIA PRIVADA (1, 2 ou 3 estrelas) */}
          {isLowRating && (
            <div className="pt-4 border-t border-[#EAE3D2] space-y-5">
              <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-left">
                <div className="flex items-start gap-2.5">
                  <MessageSquareWarning className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-amber-900">
                      Sentimos muito que sua experiência não tenha sido a esperada na Gelato Borelli.
                    </h3>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      Nosso compromisso com a qualidade artesanal é inegociável. Queremos entender exatamente o que aconteceu para corrigir.
                    </p>
                  </div>
                </div>
              </div>

              {/* Categorias de Reclamação */}
              <div>
                <label className="block text-xs font-bold text-[#1E3A24] mb-2">
                  Qual aspecto precisa de nossa atenção? <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        category === cat.id
                          ? 'border-[#1E3A24] bg-[#F4F7F4] text-[#1E3A24] font-bold shadow-sm ring-1 ring-[#1E3A24]'
                          : 'border-[#EAE3D2] hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-xs">{cat.label}</div>
                      <div className="text-[10px] text-slate-500 leading-tight truncate">{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Descrição Detalhada */}
              <div>
                <label className="block text-xs font-bold text-[#1E3A24] mb-1">
                  O que aconteceu? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Por favor, explique o ocorrido com detalhes para nossa gerência averiguar com a equipe..."
                  rows={4}
                  maxLength={2000}
                  required
                  className="w-full p-3.5 rounded-2xl border border-[#EAE3D2] bg-[#FAF7F0]/40 focus:border-[#1E3A24] focus:ring-2 focus:ring-[#1E3A24]/10 text-sm text-[#1E3A24] placeholder-slate-400 outline-none transition"
                />
                <span className="text-[11px] text-slate-400 block text-right mt-0.5">
                  {description.length}/2000 caracteres
                </span>
              </div>

              {/* Checkbox de Retorno do Cliente */}
              <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#EAE3D2] space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requestContact}
                    onChange={(e) => setRequestContact(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#1E3A24] focus:ring-[#1E3A24] border-slate-300"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#1E3A24] block">
                      Gostaria de receber um contato da gerência da Gelato Borelli
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                      Se desmarcado, seu feedback será enviado de forma 100% anônima para nossos relatórios internos.
                    </span>
                  </div>
                </label>

                {requestContact && (
                  <div className="pt-3 border-t border-[#EAE3D2] space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#1E3A24] mb-1">
                        Seu Nome (Opcional):
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Como prefere ser chamado"
                        className="w-full px-3 py-2 rounded-xl border border-[#EAE3D2] text-xs text-[#1E3A24] bg-white outline-none focus:border-[#1E3A24]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#1E3A24] mb-1">
                          WhatsApp / Telefone <span className="text-rose-500">*</span>:
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="(DDD) 99999-9999"
                          className="w-full px-3 py-2 rounded-xl border border-[#EAE3D2] text-xs text-[#1E3A24] bg-white outline-none focus:border-[#1E3A24]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#1E3A24] mb-1">
                          E-mail (Opcional):
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="w-full px-3 py-2 rounded-xl border border-[#EAE3D2] text-xs text-[#1E3A24] bg-white outline-none focus:border-[#1E3A24]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#1E3A24] mb-1">
                        Canal preferido para contato:
                      </label>
                      <div className="flex gap-2">
                        {(['WHATSAPP', 'EMAIL', 'TELEFONE'] as const).map((pref) => (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => setContactPreference(pref)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition ${
                              contactPreference === pref
                                ? 'bg-[#1E3A24] text-white border-[#1E3A24]'
                                : 'bg-white text-slate-600 border-[#EAE3D2] hover:bg-slate-50'
                            }`}
                          >
                            {pref === 'WHATSAPP' && 'WhatsApp'}
                            {pref === 'EMAIL' && 'E-mail'}
                            {pref === 'TELEFONE' && 'Ligação'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botão de Envio */}
          {rating > 0 && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#1E3A24] hover:bg-[#2A4E32] disabled:opacity-50 text-[#FAF7F0] font-bold text-sm sm:text-base shadow-lg shadow-[#1E3A24]/20 transition-all transform active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando avaliação...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Avaliação</span>
                    <Send className="w-4 h-4 text-amber-400" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* LGPD */}
          <div className="pt-3 border-t border-[#EAE3D2] flex items-center justify-center gap-2 text-[11px] text-[#7D877E] text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Seus dados são protegidos conforme a LGPD.{' '}
              <Link href="/politica-de-privacidade" className="underline hover:text-[#1E3A24]">
                Política de Privacidade
              </Link>
            </span>
          </div>
        </form>
      </div>

      <footer className="text-center text-xs text-[#7D877E] py-4">
        &copy; {new Date().getFullYear()} Gelato Borelli. Todos os direitos reservados.
      </footer>
    </main>
  );
}

export default function AvaliarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E3A24]" />
        </div>
      }
    >
      <AvaliarForm />
    </Suspense>
  );
}
