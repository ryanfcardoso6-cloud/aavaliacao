import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2 } from 'lucide-react';

export default function PoliticaPrivacidadePage() {
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a página inicial</span>
        </Link>

        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Política de Privacidade e Proteção de Dados (LGPD)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. Princípio da Coleta Mínima
            </h2>
            <p>
              Nosso sistema de avaliações foi concebido com privacidade desde a concepção (<em>privacy by design</em>).
              A coleta de feedbacks pode ser realizada de forma <strong>100% anônima</strong>. Não exigimos cadastro prévio, CPF,
              documento de identidade, endereço residencial ou qualquer dado sensível para registrar uma avaliação ou elogio.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              2. Finalidade do Tratamento de Dados
            </h2>
            <p>
              Quando você decide, voluntariamente, preencher dados de contato (como Nome, WhatsApp ou E-mail) ao registrar uma reclamação:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                <strong>Finalidade exclusiva:</strong> Entrar em contato direto com você para esclarecer o ocorrido, solucionar o problema reportado ou oferecer retratação.
              </li>
              <li>
                <strong>Base legal:</strong> Execução de medidas preliminares e legítimo interesse no atendimento do consumidor (Art. 7º, incisos V e IX da LGPD).
              </li>
              <li>
                <strong>Proibição de marketing abusivo:</strong> Seus dados de contato fornecidos neste canal <em>não</em> serão vendidos, compartilhados com terceiros nem utilizados para envio de spam publicitário.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              3. Controle de Acesso e Sigilo
            </h2>
            <p>
              As informações das reclamações e observações internas são restritas estritamente aos colaboradores autorizados da loja
              (Administradores e Gerentes). Observações internas de equipe nunca são expostas publicamente.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              4. Retenção e Anonimização
            </h2>
            <p>
              Os dados de contato fornecidos são mantidos pelo tempo estritamente necessário para apuração e resolução do caso,
              respeitando os prazos legais do Código de Defesa do Consumidor. A qualquer momento, o titular pode solicitar a anonimização
              dos seus dados de contato através dos canais oficiais da loja.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              5. Direitos do Titular (Art. 18 da LGPD)
            </h2>
            <p>
              Você possui o direito de confirmar a existência de tratamento, acessar seus dados, corrigir informações incompletas,
              ou solicitar a anonimização/exclusão dos seus dados de contato, bastando contatar o Encarregado de Dados (DPO) da loja.
            </p>
          </section>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <strong>Aviso ao Responsável do Estabelecimento:</strong> Esta política fornece os termos padrão adequados à aplicação.
            Antes de operar comercialmente em produção, revise os canais de contato institucionais no painel de configurações para refletir
            os dados exatos do seu CNPJ e responsável legal.
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
          <span>Última atualização: Outubro de 2026</span>
          <Link href="/avaliar" className="font-semibold text-brand-600 hover:text-brand-700">
            Ir para Avaliação
          </Link>
        </div>
      </div>
    </main>
  );
}
