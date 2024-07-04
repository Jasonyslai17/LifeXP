// app/quests/create/page.js
import CreateQuestClient from '../../components/CreateQuestClient';

export const metadata = {
  title: 'Create Quest | LifeXP',
  description: 'Create a new quest to level up your life!',
};

export default function CreateQuestPage() {
  return <CreateQuestClient />;
}