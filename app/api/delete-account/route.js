import { db } from '../../firebaseConfig';
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/authOptions";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
  
    if (!session) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = session.user.email;
    
    // Delete user document
    await deleteDoc(doc(db, "users", userId));

    // Delete user's skills
    const skillsRef = collection(db, "users", userId, "skills");
    const skillsSnapshot = await getDocs(skillsRef);
    const skillDeletePromises = skillsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(skillDeletePromises);

    // Delete user's quests
    const questsRef = collection(db, "users", userId, "quests");
    const questsSnapshot = await getDocs(questsRef);
    const questDeletePromises = questsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(questDeletePromises);

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