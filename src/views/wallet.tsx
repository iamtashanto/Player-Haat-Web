'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock, Copy, Wallet as WalletIcon } from 'lucide-react';
import { PhBadge, PhBottomSheet, PhButton, PhCard, PhChip, PhTextField } from '@/design-system';
import { useCheckout, usePayments, useSubmitPayment, useTransactions, useWallet, type Payment } from '@/lib/api/billing';
import { LoadMore, QueryState, Screen, SectionTitle, useFmt } from '@/components/app/kit';

const METHOD_KEY = { BKASH: 'payBkash', NAGAD: 'payNagad', ROCKET: 'payRocket' } as const;
const PAY_STATUS = { PENDING: 'payStatusPending', SUBMITTED: 'payStatusSubmitted', PAID: 'payStatusPaid', REJECTED: 'payStatusRejected' } as const;
const REASON_KEY: Record<string, string> = { PURCHASE: 'creditReasonPurchase', CONTACT_VIEW: 'creditReasonContact', BOOST: 'creditReasonBoost', ADMIN_GRANT: 'creditReasonGrant', GRANT: 'creditReasonGrant', REFUND: 'creditReasonRefund' };

/** Pay by sending money to the number shown, then enter the transaction id; an admin approves it and the credits arrive. */
function PaymentSheet({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
  const { t, money, num, fail, ok } = useFmt();
  const submit = useSubmitPayment();
  const [trx, setTrx] = useState('');
  const [sender, setSender] = useState('');
  if (!payment) return null;
  const go = async () => {
    try {
      await submit.mutateAsync({ id: payment.id, body: { trxId: trx.trim().toUpperCase(), senderNumber: sender.trim() } });
      ok(t('payDoneToast'));
      onClose();
    } catch (e) {
      fail(e);
    }
  };
  return (
    <PhBottomSheet open onOpenChange={(o) => !o && onClose()} title={t(METHOD_KEY[payment.method])}>
      <div className="tx-subhead-strong">{t('payInstructionsTitle')}</div>
      <p className="tx-subhead mt-1">{t('payInstructionsBody')}</p>
      <PhCard paddingClassName="p-4" className="mt-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="tx-footnote text-[var(--ph-text-tertiary)]">{money(payment.amountBdt)} · {t('walletPackCredits', { n: num(payment.credits) })}</div>
            <div className="tx-title2 select-all" dir="ltr">{payment.payTo}</div>
          </div>
          {payment.payTo && <PhButton label={t('payCopyNumber')} icon={<Copy className="h-4 w-4" />} size="small" variant="secondary" expand={false} onPressed={() => void navigator.clipboard.writeText(payment.payTo!).then(() => ok(t('contactCopied')))} />}
        </div>
      </PhCard>
      <div className="mt-4 flex flex-col gap-3">
        <PhTextField placeholder={t('payTrxHint')} value={trx} onChange={(v) => setTrx(v.toUpperCase())} maxLength={24} autoComplete="off" />
        <PhTextField placeholder={t('paySenderHint')} type="tel" inputMode="tel" value={sender} onChange={setSender} maxLength={14} />
      </div>
      <div className="mt-5">
        <PhButton label={t('paySubmit')} loading={submit.isPending} disabled={!/^[A-Z0-9]{6,24}$/.test(trx.trim()) || sender.trim().length < 10} onPressed={() => void go()} />
      </div>
    </PhBottomSheet>
  );
}

export default function WalletView() {
  const { t, money, num, ago, fail } = useFmt();
  const wallet = useWallet();
  const tx = useTransactions();
  const pays = usePayments();
  const checkout = useCheckout();
  const [packId, setPackId] = useState<string | null>(null);
  const [method, setMethod] = useState<'BKASH' | 'NAGAD' | 'ROCKET' | null>(null);
  const [active, setActive] = useState<Payment | null>(null);
  const w = wallet.data;
  const pending = pays.items.filter((p) => p.status === 'PENDING' || p.status === 'SUBMITTED');

  const buy = async () => {
    if (!packId || !method) return;
    try {
      setActive(await checkout.mutateAsync({ packId, method }));
      void pays.refetch();
    } catch (e) {
      fail(e);
    }
  };

  return (
    <Screen title={t('walletTitle')} back>
      <div className="mx-auto grid max-w-3xl gap-4">
        <QueryState query={wallet} isEmpty={!w} emptyIcon={<WalletIcon className="h-6 w-6" />} emptyTitle={t('walletTitle')} skeletons={1}>
          {w && (
            <>
              <PhCard paddingClassName="p-5">
                <div className="tx-footnote text-[var(--ph-text-tertiary)]">{t('walletBalance')}</div>
                <div className="tx-large-title text-[var(--ph-accent)]">{num(w.balance)}</div>
                <p className="tx-footnote mt-1">{w.pricing.contactCreditsEnabled ? t('walletNote', { free: num(w.pricing.freeContactsPerDay), cost: num(w.pricing.contactCreditCost) }) : t('walletFreeNote')}</p>
              </PhCard>

              {pending.map((p) => (
                <PhCard key={p.id} onTap={p.status === 'PENDING' ? () => setActive(p) : undefined} paddingClassName="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[var(--ph-warning)]" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="tx-headline">{p.status === 'PENDING' ? t('payInstructionsTitle') : t('payWaitingTitle')}</div>
                      <div className="tx-subhead">{p.status === 'PENDING' ? `${t(METHOD_KEY[p.method])} · ${money(p.amountBdt)}` : t('payWaitingBody')}</div>
                    </div>
                    <PhBadge tone="warning" label={t(PAY_STATUS[p.status])} />
                  </div>
                </PhCard>
              ))}

              <SectionTitle>{t('walletBuy')}</SectionTitle>
              {w.methods.length === 0 ? (
                <p className="tx-subhead">{t('errPaymentUnavailable')}</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {w.packs.map((pk) => (
                      <PhCard key={pk.id} onTap={() => setPackId(pk.id)} paddingClassName={`p-4 ${packId === pk.id ? 'ring-2 ring-[var(--ph-accent)]' : ''}`}>
                        <div className="tx-title2">{t('walletPackCredits', { n: num(pk.credits) })}</div>
                        <div className="tx-subhead-strong text-[var(--ph-accent)]">{t('walletPrice', { n: num(pk.priceBdt) })}</div>
                      </PhCard>
                    ))}
                  </div>
                  <div className="tx-subhead-strong mt-3">{t('payWith')}</div>
                  <div className="flex flex-wrap gap-2">
                    {w.methods.map((m) => (
                      <PhChip key={m.method} label={t(METHOD_KEY[m.method])} selected={method === m.method} onTap={() => setMethod(m.method)} />
                    ))}
                  </div>
                  <PhButton label={t('walletBuy')} disabled={!packId || !method} loading={checkout.isPending} onPressed={() => void buy()} />
                </>
              )}
            </>
          )}
        </QueryState>

        <SectionTitle>{t('walletHistory')}</SectionTitle>
        <QueryState query={tx} isEmpty={tx.items.length === 0} emptyIcon={<WalletIcon className="h-6 w-6" />} emptyTitle={t('walletEmptyHistory')} skeletons={2}>
          <PhCard paddingClassName="px-4">
            {tx.items.map((x) => (
              <div key={x.id} className="flex items-center gap-3 border-b-[0.5px] border-[var(--ph-border)] py-3 last:border-0">
                {x.delta > 0 ? <CheckCircle2 className="h-5 w-5 text-[var(--ph-accent)]" aria-hidden /> : <WalletIcon className="h-5 w-5 text-[var(--ph-text-tertiary)]" aria-hidden />}
                <div className="min-w-0 flex-1">
                  <div className="tx-subhead-strong">{t(REASON_KEY[x.reason] ?? 'creditReasonGrant')}</div>
                  <div className="tx-footnote text-[var(--ph-text-tertiary)]">{ago(x.createdAt)}</div>
                </div>
                <span className={`tx-headline ${x.delta > 0 ? 'text-[var(--ph-accent)]' : ''}`}>{x.delta > 0 ? '+' : ''}{num(x.delta)}</span>
              </div>
            ))}
          </PhCard>
          <LoadMore hasNext={!!tx.hasNextPage} loading={tx.isFetchingNextPage} onMore={() => void tx.fetchNextPage()} />
        </QueryState>
      </div>
      <PaymentSheet key={active?.id} payment={active} onClose={() => setActive(null)} />
    </Screen>
  );
}
