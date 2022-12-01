import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";

import Account from "../../components/Account";
import styles from "../../styles/Home.module.css";

export default function AccountPage() {
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
        <Account session={session} />
      )}
    </div>
  );
}
