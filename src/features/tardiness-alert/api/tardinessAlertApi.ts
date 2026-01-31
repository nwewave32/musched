import { httpsCallable } from "firebase/functions";
import { functions } from "@shared/config/firebase";

const sendTardinessAlertFn = httpsCallable(functions, "sendTardinessAlert");

export const sendTardinessAlert = async (
  lessonId: string,
  senderId: string
): Promise<void> => {
  await sendTardinessAlertFn({ lessonId, senderId });
};
