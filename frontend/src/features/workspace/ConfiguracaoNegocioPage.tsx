import { useState } from 'react'
import type { FormEvent } from 'react'
import { Save } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import { useToast } from '../../components/ui/toast/toastContext'
import { obterConfiguracaoNegocio, salvarConfiguracaoNegocio } from '../../lib/negocio'

function ConfiguracaoNegocioPage() {
  const mostrarToast = useToast()
  const [dados, setDados] = useState(obterConfiguracaoNegocio)
  const [salvando, setSalvando] = useState(false)

  function atualizar(campo: keyof typeof dados, valor: string) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
  }

  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setSalvando(true)

    try {
      salvarConfiguracaoNegocio({ ...dados, nome: dados.nome.trim() })
      mostrarToast({ title: 'Configurações Salvas', description: 'Os dados do Negócio foram atualizados.' })
    } catch {
      mostrarToast({
        title: 'Não foi possível Salvar',
        description: 'Confira o armazenamento do navegador e tente novamente.',
        tone: 'error',
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Workspace', to: '/app' }, { label: 'Configurações do Negócio' }]}
        title="Configurações do Negócio"
        description="Mantenha os dados de contato e apresentação do seu Negócio atualizados."
      />

      <Card className="mt-7 max-w-3xl p-5 sm:p-7">
        <form onSubmit={salvar} className="flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Dados Básicos</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              As informações são salvas neste navegador.
            </p>
          </div>

          <Input
            label="Nome do Negócio"
            autoComplete="organization"
            placeholder="Ex.: Studio Aurora"
            value={dados.nome}
            onChange={(evento) => atualizar('nome', evento.target.value)}
            required
            maxLength={100}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="E-mail de Contato"
              type="email"
              autoComplete="email"
              placeholder="contato@empresa.com"
              value={dados.email}
              onChange={(evento) => atualizar('email', evento.target.value)}
              maxLength={254}
            />
            <Input
              label="Telefone"
              type="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              value={dados.telefone}
              onChange={(evento) => atualizar('telefone', evento.target.value)}
              maxLength={30}
            />
          </div>

          <Input
            label="Endereço"
            autoComplete="street-address"
            placeholder="Rua, número, bairro e cidade"
            value={dados.endereco}
            onChange={(evento) => atualizar('endereco', evento.target.value)}
            maxLength={200}
          />

          <Textarea
            label="Sobre o Negócio"
            placeholder="Conte brevemente o que seu Negócio oferece."
            value={dados.descricao}
            onChange={(evento) => atualizar('descricao', evento.target.value)}
            maxLength={500}
            rows={4}
          />

          <div className="flex justify-end border-t border-line pt-4">
            <Button type="submit" loading={salvando} icon={<Save size={15} strokeWidth={1.7} />}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}

export default ConfiguracaoNegocioPage
