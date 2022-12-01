import {
  useUser,
  useSupabaseClient,
  Session,
} from "@supabase/auth-helpers-react";
import { Database } from "../utils/database.types";
import styles from "./Chat.module.css";

type Profiles = Database["public"]["Tables"]["profiles"]["Row"];
type Messages = Database["public"]["Tables"]["messages"]["Row"];

export default function Chat({ session }: { session: Session }) {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();

  return (
    <div>
      <h1>Go crazy</h1>
      <p>Create your own chat!</p>
    </div>
  );
}
