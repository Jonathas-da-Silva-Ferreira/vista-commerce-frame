import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * NavigationProgress — barra superior estilo NProgress.
 *
 * Por quê: navegação em SPA é instantânea em CPU, mas a percepção do usuário
 * depende de feedback imediato. Sem indicador, cliques em <Link> parecem
 * "engasgar" — especialmente quando code-splitting carrega o chunk da rota.
 * Esta barra dispara em TODA mudança de pathname e some quando o chunk
 * resolve, eliminando a sensação de "site travou".
 *
 * Implementação CSS (zero deps): scaleX animado num <div> fixo no topo.
 * Mais leve que NProgress e evita um package só pra isso.
 */
export default function NavigationProgress() {
  const location = useLocation();
  // `progress` 0–100: avança em saltos para parecer trabalho real e
  // termina em 100 ao desmontar (efeito de "fade out" via opacidade).
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reseta a cada mudança de rota — o usuário precisa ver a barra
    // "reiniciar" para entender que houve uma nova navegação.
    setVisible(true);
    setProgress(15);

    // Avanço escalonado simula incerteza de tempo de chunk-load.
    // Nunca chega a 100 aqui — só na finalização (linha abaixo).
    const tick1 = setTimeout(() => setProgress(45), 100);
    const tick2 = setTimeout(() => setProgress(75), 300);

    // Finalização: 100% + fade-out. Timeout maior que duração do
    // chunk-load típico (<200ms) garante que o usuário vê o "completo".
    const finish = setTimeout(() => {
      setProgress(100);
      // Espera o CSS transition de width terminar antes de esconder.
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
    }, 500);

    return () => {
      clearTimeout(tick1);
      clearTimeout(tick2);
      clearTimeout(finish);
    };
  }, [location.pathname]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-0.5 pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))] transition-[width,opacity] duration-200 ease-out"
        style={{
          width: `${progress}%`,
          // Opacidade controla o fade-out final sem precisar de keyframe.
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}
