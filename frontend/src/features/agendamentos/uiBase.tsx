import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import AvatarBase from '../../components/ui/Avatar';
import ButtonBase from '../../components/ui/Button';
import CardBase from '../../components/ui/Card';
import InputBase from '../../components/ui/Input';
import StatusBadgeBase from '../../components/ui/StatusBadge';
import type { StatusTone } from '../../components/ui/StatusBadge';
import PageHeaderBase from '../../components/layout/PageHeader';
import type { StatusAgendamento } from './types';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

export interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onDrag' | 'onDragStart' | 'onDragEnd'
  > {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  type?: 'button' | 'submit';
}

const variantMap = {
  primary: 'primary',
  outline: 'secondary',
  ghost: 'ghost',
  danger: 'secondary',
} as const;

export function Button({ variant = 'primary', size = 'md', type = 'button', className = '', ...resto }: ButtonProps) {
  const extra = variant === 'danger' ? 'text-danger hover:text-danger' : '';
  return <ButtonBase variant={variantMap[variant]} size={size} type={type} className={`${extra} ${className}`} {...resto} />;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <CardBase className={className}>{children}</CardBase>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <PageHeaderBase
      breadcrumb={[{ label: 'Workspace', to: '/app' }, { label: title }]}
      title={title}
      description={description}
      actions={actions}
    />
  );
}

const statusMap: Record<StatusAgendamento, { tone: StatusTone; label: string }> = {
  confirmado: { tone: 'success', label: 'Confirmado' },
  aguardando: { tone: 'warning', label: 'Aguardando' },
  cancelado: { tone: 'danger', label: 'Cancelado' },
};

export function StatusBadge({ status }: { status: StatusAgendamento }) {
  const { tone, label } = statusMap[status];
  return (
    <StatusBadgeBase tone={tone} pulse={status === 'aguardando'}>
      {label}
    </StatusBadgeBase>
  );
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return <AvatarBase name={name} size={size} variant={size === 'sm' ? 'outline' : 'filled'} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <InputBase {...props} />;
}