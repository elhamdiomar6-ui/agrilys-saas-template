import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { UserRole } from '../types/roles';
import { getStorageKey } from '../lib/storage/storageUtils';

const BUREAU_SEEN_KEY = getStorageKey('bureau.inscriptions.lastSeenAt', 'v1');
const PRESIDENT_SEEN_KEY = getStorageKey('president.inscriptions.lastSeenAt', 'v1');

export function useInscriptionsBadge(role: UserRole | null) {
  const [badge, setBadge] = useState(0);
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null);

  useEffect(() => {
    if (!supabase || (role !== 'bureau' && role !== 'president')) return;

    const isBureau = role === 'bureau';
    const storageKey = isBureau ? BUREAU_SEEN_KEY : PRESIDENT_SEEN_KEY;
    const filterStatus = isBureau ? 'pending' : 'under_review';
    const dateCol = isBureau ? 'created_at' : 'updated_at';
    const lastSeen = localStorage.getItem(storageKey) ?? '1970-01-01T00:00:00.000Z';

    supabase
      .from('registration_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', filterStatus)
      .gt(dateCol, lastSeen)
      .then(({ count }) => {
        if (count && count > 0) setBadge(count);
      });

    const channelName = `inscriptions-badge-${role}`;
    const ch = supabase.channel(channelName);
    channelRef.current = ch;

    if (isBureau) {
      ch.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'registration_requests' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if ((payload.new as { status?: string })?.status === 'pending') {
            setBadge((b) => b + 1);
          }
        },
      );
    } else {
      ch.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'registration_requests' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const p = payload as { new?: { status?: string }; old?: { status?: string } };
          if (p.new?.status === 'under_review' && p.old?.status !== 'under_review') {
            setBadge((b) => b + 1);
          }
        },
      );
    }

    ch.subscribe();

    return () => {
      if (supabase) void supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [role]);

  function clearBadge() {
    setBadge(0);
    const storageKey = role === 'president' ? PRESIDENT_SEEN_KEY : BUREAU_SEEN_KEY;
    localStorage.setItem(storageKey, new Date().toISOString());
  }

  return { badge, clearBadge };
}
