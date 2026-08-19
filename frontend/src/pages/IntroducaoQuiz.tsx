import { useNavigate } from 'react-router-dom';
import './IntroducaoQuiz.css';

export function IntroducaoQuiz() {
  const navigate = useNavigate();

  return (
    <div className="introducao-container">
      <div className="introducao-card">
        <div className="introducao-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A2438" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </div>

        <h1>Vamos encontrar o seu caminho de TCC</h1>
        <p className="introducao-texto">
          A seguir, você vai responder um fluxograma de perguntas para descobrir o template ideal
          para o seu trabalho e te ajudar a encontrar um tema e um orientador compatíveis.
        </p>
        <p className="introducao-tempo">⏱ Leva em média 5 minutos para responder — é rapidinho.</p>

        <button className="btn-iniciar-fluxo" onClick={() => navigate('/quiz')}>
          Iniciar Fluxo de Decisão
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
