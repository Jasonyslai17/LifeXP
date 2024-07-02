import './firebaseConfig';
import UserProfile from "./components/UserProfile";
import DashboardClient from './components/DashboardClient';
import { userData, initialSkills } from './mockData';

export default function Home() {
  return (
    <div className="container">
      <UserProfile />
      <DashboardClient />
    </div>
  );
}