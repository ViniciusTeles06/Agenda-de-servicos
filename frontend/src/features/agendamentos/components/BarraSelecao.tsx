import { Button } from '../uiBase';

interface Props {
  quantidade: number;
  aoConfirmar: () => void;
  aoCancelar: () => void;
  aoLimpar: () => void;
}

/** Ações em lote: aparece quando há linhas marcadas. */
export function BarraSelecao({ quantidade, aoConfirmar, aoCancelar, aoLimpar }: Props) {
  return (
    <div className="agd-selecao" role="region" aria-label="Ações para os agendamentos selecionados">
      <p className="agd-selecao-texto" aria-live="polite">
        {quantidade} {quantidade === 1 ? 'selecionado' : 'selecionados'}
      </p>
      <div className="agd-selecao-acoes">
        <Button size="sm" variant="outline" onClick={aoConfirmar}>Confirmar</Button>
        <Button size="sm" variant="outline" onClick={aoCancelar}>Cancelar agendamentos</Button>
        <Button size="sm" variant="ghost" onClick={aoLimpar}>Limpar seleção</Button>
      </div>
    </div>
  );
}