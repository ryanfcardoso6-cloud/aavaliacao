import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redireciona a raiz do site diretamente para o painel administrativo
  redirect('/admin');
}
