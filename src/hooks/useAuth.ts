import { useState, useEffect } from 'react';
1: import { supabase } from '@/integrations/supabase/client';
2: import type { User, Session } from '@supabase/supabase-js';
3: 
4: export function useAuth() {
5:   const [user, setUser] = useState<User | null>(null);
6:   const [session, setSession] = useState<Session | null>(null);
7:   const [loading, setLoading] = useState(true);
8:   const [isAdmin, setIsAdmin] = useState<boolean>(false);
9: 
10:   const checkAdminStatus = async (email: string | undefined) => {
11:     if (!email) {
12:       setIsAdmin(false);
13:       return;
14:     }
15:     try {
16:       const { data, error } = await supabase
17:         .from('admin_users')
18:         .select('email')
19:         .eq('email', email)
20:         .maybeSingle();
21:       
22:       setIsAdmin(!!data);
23:     } catch (err) {
24:       console.error('Error checking admin status:', err);
25:       setIsAdmin(false);
26:     }
27:   };
28: 
29:   useEffect(() => {
30:     const { data: { subscription } } = supabase.auth.onAuthStateChange(
31:       async (_event, session) => {
32:         setSession(session);
33:         setUser(session?.user ?? null);
34:         if (session?.user?.email) {
35:           await checkAdminStatus(session.user.email);
36:         } else {
37:           setIsAdmin(false);
38:         }
39:         setLoading(false);
40:       }
41:     );
42: 
43:     supabase.auth.getSession().then(async ({ data: { session } }) => {
44:       setSession(session);
45:       setUser(session?.user ?? null);
46:       if (session?.user?.email) {
47:         await checkAdminStatus(session.user.email);
48:       }
49:       setLoading(false);
50:     });
51: 
52:     return () => subscription.unsubscribe();
53:   }, []);
54: 
55:   const signIn = async (email: string, password: string) => {
56:     const { error } = await supabase.auth.signInWithPassword({ email, password });
57:     if (error) throw error;
58:   };
59: 
60:   const signOut = async () => {
61:     const { error } = await supabase.auth.signOut();
62:     if (error) throw error;
63:   };
64: 
65:   return { user, session, loading, isAdmin, signIn, signOut };
66: }