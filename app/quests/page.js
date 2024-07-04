// app/quests/page.js
import QuestsClient from '../components/QuestsClient';

export const metadata = {
  title: 'Quests | LifeXP',
  description: 'Create and complete quests to level up your life!',
};

export default function QuestsPage() {
  return <QuestsClient />;
}