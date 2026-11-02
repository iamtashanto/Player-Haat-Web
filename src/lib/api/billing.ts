'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post, type Body, type Data } from './core';
import { usePaged } from './paged';

export type Wallet = Data<'/billing/wallet'>;
export type Payment = Data<'/billing/payments'> extends (infer A)[] ? A : never;
export type CreditTx = Data<'/billing/transactions'> extends (infer A)[] ? A : never;

export const useWallet = () => useQuery({ queryKey: ['wallet'], queryFn: () => get<Wallet>('/billing/wallet') });
export const useTransactions = () => usePaged<CreditTx>(['wallet', 'transactions'], '/billing/transactions');
export const usePayments = () => usePaged<Payment>(['wallet', 'payments'], '/billing/payments');

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (b: Body<'/billing/checkout'>) => post<Payment>('/billing/checkout', b), onSuccess: () => qc.invalidateQueries({ queryKey: ['wallet'] }) });
}
export function useSubmitPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; body: Body<'/billing/payments/{id}/submit'> }) => post<Payment>(`/billing/payments/${v.id}/submit`, v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallet'] }),
  });
}
