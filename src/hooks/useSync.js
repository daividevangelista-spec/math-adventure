import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSync(user) {
  const [isSynced, setIsSynced] = useState(false);

  // Mock sync function for now
  const syncData = async (data) => {
    localStorage.setItem(`math_adventure_${user.id}`, JSON.stringify(data));
    
    // Placeholder for Supabase logic
    if (supabase.auth.getSession()) {
      // await supabase.from('profiles').upsert({ id: user.id, ...data });
    }
  };

  const loadData = () => {
    const local = localStorage.getItem(`math_adventure_${user?.id}`);
    return local ? JSON.parse(local) : null;
  };

  return { syncData, loadData, isSynced };
}
