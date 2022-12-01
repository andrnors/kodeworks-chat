import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";

import Chat from "../components/Chat";
import styles from "../styles/Home.module.css";

export default function Home() {
  const session = useSession();
  const supabase = useSupabaseClient();

  return (
    <div className={styles.container}>
      {!session ? (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
        />
      ) : (
        <Chat session={session} />
      )}
    </div>
  );
}
