import { db } from '../../firebaseConfig';
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = session.user.email;
  
  try {
    // Delete user document
    await deleteDoc(doc(db, "users", userId));

    // Delete user's skills
    const skillsRef = collection(db, `users/${userId}/skills`);
    const skillsSnapshot = await getDocs(skillsRef);
    skillsSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Delete user's quests
    const questsRef = collection(db, `users/${userId}/quests`);
    const questsSnapshot = await getDocs(questsRef);
    questsSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}