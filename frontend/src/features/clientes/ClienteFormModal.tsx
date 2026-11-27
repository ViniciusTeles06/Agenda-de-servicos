import { useState } from 'react'
import type { FormEvent } from 'react'
import { LoaderCircle, Search } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { ApiError } from '../../lib/api'
import { apenasDigitos, formatarTelefone } from '../../lib/formatters'
import { atualizarCliente, criarCliente } from './clientesApi'
import type { Cliente, ClienteEntrada, EnderecoCliente } from './types'

interface ClienteFormModalProps {
  open: boolean
  cliente: Cliente | null
  onClose: () => void
  onSaved: (cliente: Cliente, novo: boolean) => void
}

type Valores = Omit<ClienteEntrada, 'telefone'> & { telefone: string }
type Erros = Partial<Record<'nome' | 'email' | 'telefone' | 'cep' | 'rua' | 'numero' | 'bairro' | 'cidade' | 'uf', string>>

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const enderecoVazio: EnderecoCliente = { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' }

function formatarCep(valor: string) {
  const digitos = apenasDigitos(valor).slice(0, 8)
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos
}

function validar(valores: Valores): Erros {
  const erros: Erros = {}
  const cep = apenasDigitos(valores.endereco.cep)

  if (valores.nome.trim().length < 3) erros.nome = 'Informe o nome completo.'
  if (!EMAIL_VALIDO.test(valores.email.trim())) erros.email = 'Digite um e-mail válido.'
  if (valores.telefone && (apenasDigitos(valores.telefone).length < 10 || apenasDigitos(valores.telefone).length > 11)) erros.telefone = 'Digite o DDD e o número.'
  if (cep.length !== 8) erros.cep = 'Digite um CEP com 8 números.'
  if (!valores.endereco.rua.trim()) erros.rua = 'Informe a rua.'
  if (!valores.endereco.numero.trim()) erros.numero = 'Informe o número.'
  if (!valores.endereco.bairro.trim()) erros.bairro = 'Informe o bairro.'
  if (!valores.endereco.cidade.trim()) erros.cidade = 'Informe a cidade.'
  if (valores.endereco.uf.trim().length !== 2) erros.uf = 'Use a sigla do estado.'

  return erros
}

function ClienteFormModal({ open, cliente, onClose, onSaved }: ClienteFormModalProps) {
  const [valores, setValores] = useState<Valores>({
    nome: cliente?.nome ?? '',
    email: cliente?.email ?? '',
    telefone: formatarTelefone(cliente?.telefone ?? ''),
    endereco: cliente ? { ...cliente.endereco, cep: formatarCep(cliente.endereco.cep) } : enderecoVazio,
  })
  const [erros, setErros] = useState<Erros>({})
  const [erroGeral, setErroGeral] = useState('')
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [avisoCep, setAvisoCep] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const editando = cliente !== null

  function atualizar(proximo: Partial<Valores>) {
    const novos = { ...valores, ...proximo }
    setValores(novos)
    if (enviado) setErros(validar(novos))
  }

  function atualizarEndereco(proximo: Partial<EnderecoCliente>) {
    atualizar({ endereco: { ...valores.endereco, ...proximo } })
  }

  async function consultarCep() {
    const cep = apenasDigitos(valores.endereco.cep)
    setAvisoCep('')
    if (cep.length !== 8) {
      setErros((atual) => ({ ...atual, cep: 'Digite um CEP com 8 números.' }))
      return
    }

    setBuscandoCep(true)
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      if (!resposta.ok) throw new Error()
      const endereco = (await resposta.json()) as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string }
      if (endereco.erro) {
        setAvisoCep('CEP não encontrado. Confira o número ou preencha o endereço manualmente.')
        return
      }

      atualizarEndereco({
        cep: formatarCep(cep),
        rua: endereco.logradouro ?? '',
        bairro: endereco.bairro ?? '',
        cidade: endereco.localidade ?? '',
        uf: endereco.uf ?? '',
      })
      setErros((atual) => ({ ...atual, cep: undefined, rua: undefined, bairro: undefined, cidade: undefined, uf: undefined }))
      setAvisoCep('Endereço preenchido pelo CEP. Complete o número, se necessário.')
    } catch {
      setAvisoCep('Não foi possível consultar o CEP agora. Você pode preencher o endereço manualmente.')
    } finally {
      setBuscandoCep(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEnviado(true)
    setErroGeral('')
    const encontrados = validar(valores)
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return

    const dados: ClienteEntrada = {
      nome: valores.nome.trim(),
      email: valores.email.trim().toLowerCase(),
      telefone: apenasDigitos(valores.telefone) || null,
      endereco: {
        ...valores.endereco,
        cep: apenasDigitos(valores.endereco.cep),
        rua: valores.endereco.rua.trim(),
        numero: valores.endereco.numero.trim(),
        complemento: valores.endereco.complemento.trim(),
        bairro: valores.endereco.bairro.trim(),
        cidade: valores.endereco.cidade.trim(),
        uf: valores.endereco.uf.trim().toUpperCase(),
      },
    }

    setSalvando(true)
    try {
      const salvo = editando ? await atualizarCliente(cliente.id, dados) : await criarCliente(dados)
      onSaved(salvo, !editando)
    } catch (falha) {
      setSalvando(false)
      if (falha instanceof ApiError && falha.status === 409) {
        setErros({ email: falha.message })
        return
      }
      setErroGeral(falha instanceof Error ? falha.message : 'Não foi possível salvar. Tente de novo.')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeDisabled={salvando}
      title={editando ? 'Editar cliente' : 'Novo cliente'}
      description="Cadastre os dados de contato e o endereço para facilitar os atendimentos."
      footer={<><Button variant="secondary" onClick={onClose} disabled={salvando}>Cancelar</Button><Button type="submit" form="cliente-form" loading={salvando}>{editando ? 'Salvar alterações' : 'Cadastrar cliente'}</Button></>}
    >
      <form id="cliente-form" noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        {erroGeral && <p role="alert" className="rounded-md border border-[#F1C9CA] bg-[#FBEDED] px-3.5 py-2.5 text-xs leading-snug text-danger">{erroGeral}</p>}

        <Input label="Nome completo" placeholder="Ex.: Mariana Alves" autoComplete="name" value={valores.nome} maxLength={120} error={erros.nome} onChange={(event) => atualizar({ nome: event.target.value })} data-autofocus />
        <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
          <Input label="E-mail" type="email" placeholder="nome@exemplo.com" autoComplete="email" value={valores.email} maxLength={150} error={erros.email} onChange={(event) => atualizar({ email: event.target.value })} />
          <Input label="Telefone" type="tel" inputMode="numeric" placeholder="(82) 99999-0000" autoComplete="tel" value={valores.telefone} error={erros.telefone} onChange={(event) => atualizar({ telefone: formatarTelefone(event.target.value) })} />
        </div>

        <fieldset className="flex flex-col gap-5 border-t border-line pt-5">
          <legend className="mb-0.5 text-[13px] leading-none font-medium text-ink">Endereço</legend>
          <Input label="CEP" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" value={valores.endereco.cep} error={erros.cep} hint={!erros.cep ? avisoCep : undefined} trailing={buscandoCep ? <LoaderCircle aria-label="Consultando CEP" size={16} className="animate-spin text-brand" /> : <button type="button" aria-label="Consultar CEP" onClick={consultarCep} className="flex size-7 items-center justify-center rounded text-muted transition-colors hover:bg-surface-soft hover:text-brand"><Search size={15} /></button>} onBlur={consultarCep} onChange={(event) => { atualizarEndereco({ cep: formatarCep(event.target.value) }); setAvisoCep('') }} />
          <div className="grid gap-5 sm:grid-cols-[1.45fr_0.55fr]">
            <Input label="Rua" autoComplete="address-line1" placeholder="Rua, avenida ou praça" value={valores.endereco.rua} error={erros.rua} onChange={(event) => atualizarEndereco({ rua: event.target.value })} />
            <Input label="Número" autoComplete="address-line2" placeholder="Ex.: 120" value={valores.endereco.numero} error={erros.numero} onChange={(event) => atualizarEndereco({ numero: event.target.value })} />
          </div>
          <Input label="Complemento" autoComplete="address-line2" placeholder="Apto., bloco, sala (opcional)" value={valores.endereco.complemento} onChange={(event) => atualizarEndereco({ complemento: event.target.value })} />
          <div className="grid gap-5 sm:grid-cols-[1.15fr_1fr_0.42fr]">
            <Input label="Bairro" autoComplete="address-level3" placeholder="Bairro" value={valores.endereco.bairro} error={erros.bairro} onChange={(event) => atualizarEndereco({ bairro: event.target.value })} />
            <Input label="Cidade" autoComplete="address-level2" placeholder="Cidade" value={valores.endereco.cidade} error={erros.cidade} onChange={(event) => atualizarEndereco({ cidade: event.target.value })} />
            <Input label="UF" autoComplete="address-level1" placeholder="AL" value={valores.endereco.uf} maxLength={2} error={erros.uf} onChange={(event) => atualizarEndereco({ uf: event.target.value.toUpperCase() })} />
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}

export default ClienteFormModal
