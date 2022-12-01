import { useState, useEffect } from "react";
import {
  useUser,
  useSupabaseClient,
  Session,
} from "@supabase/auth-helpers-react";
import { Database } from "../utils/database.types";
import { RealtimePostgresChangesPayload } from "@supabase/realtime-js";
import styles from "./Chat.module.css";
import { profile } from "console";

type Profiles = Database["public"]["Tables"]["profiles"]["Row"];
type Messages = Database["public"]["Tables"]["messages"]["Row"];

export default function Chat({ session }: { session: Session }) {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const [profiles, setProfiles] = useState<Record<string, Profiles>>({});
  const [messages, setMessages] = useState<Messages[]>();
  const [messageContent, setMessageContent] = useState<string>();

  async function loadProfileCache(profileId: string) {
    if (profiles[profileId] != null) {
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select()
      .eq("id", profileId)
      .single();
    const profile = data;
    setProfiles({ ...profiles, [profileId]: profile });
  }

  useEffect(() => {
    const profiles = supabase
      .channel("*")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload) {
            const newMessage = payload.new as Messages;
            loadProfileCache(newMessage.profile_id!);
            setMessages([newMessage]);
          }
        }
      )
      .subscribe();
    return () => {
      profiles.unsubscribe();
    };
  }, [supabase]);

  async function fetchIntialMessages() {
    const { data: messages } = await supabase.from("messages").select("*");
    if (messages == null) return;
    const profileIds = Array.from(
      new Set(messages.map((message) => message.profile_id))
    );

    const { data: profileCache } = await supabase
      .from("profiles")
      .select("*")
      .in("id", [...profileIds]);

    setProfiles(
      profileCache?.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {})
    );

    console.log(profileCache);

    setMessages(messages);
  }

  async function createPost() {
    if (messageContent == null || messageContent === "") return;
    await supabase
      .from("messages")
      .insert([{ profile_id: user?.id, message: messageContent }])
      .single();
    fetchIntialMessages();
  }

  useEffect(() => {
    fetchIntialMessages();
  }, [session]);

  if (!user) {
    return <div>Not logged in</div>;
  }
  return (
    <div className="form-widget">
      <h1>Messages</h1>
      <div className={styles.chat}>
        {messages &&
          messages.length > 0 &&
          messages.map((m: Messages) => (
            <MessageBox
              userId={user.id}
              key={m.id}
              message={m}
              sender={profiles[m.profile_id!]?.username ?? "Not username"}
            />
          ))}
      </div>

      <div className={styles.form}>
        <form className={styles.form}>
          <input
            type="text"
            name="message"
            placeholder="Enter your message"
            defaultValue={messageContent}
            onChange={(event) => setMessageContent(event.target.value)}
          />
          <input type="button" value="Send" onClick={(event) => createPost()} />
        </form>
      </div>
    </div>
  );
}

type MessageBoxProps = {
  userId: string;
  message: Messages;
  sender: string;
};

function MessageBox({ userId, message, sender }: MessageBoxProps): JSX.Element {
  return (
    <div
      className={
        userId == message.profile_id
          ? styles.personalContainer
          : styles.container
      }
    >
      <p className={styles.username}>{sender}</p>
      <p className={styles.username}>{message?.profile_id}</p>
      <p className={styles.message}>{message?.message}</p>
    </div>
  );
}
