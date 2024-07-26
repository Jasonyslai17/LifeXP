'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Tutorial.module.css';

export default function TutorialPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Create Skills 🧩",
      content: "Start by creating skills you want to improve.\nClick on 'Build a New Skill' and give it a name and an emoji."
    },
    {
      title: "Log Time ⌛",
      content: "After working on a skill, log the time you spent.\nClick on a skill card and then click the '+' button to log time."
    },
    {
      title: "Track Progress 📈",
      content: "Watch your skills level up as you log more time.\n 1 hour = 1XP."
    },
    {
      title: "Complete Quests ✅",
      content: "Create and complete quests to earn extra XP.\nCustomise your own difficulty."
    },
    {
      title: "Review your progress 📚",
      content: "Click on a skill to see a detailed view of your logged entries.\nMonitor your overall progress and see how far you've come!"
    },
    {
      title: "Compete globally 🥊",
      content: "Compare yourself with other players using the global leaderboard."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Function to render content with line breaks
  const renderContent = (content) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className={styles.tutorialPage}>
      <button onClick={() => router.back()} className={styles.backButton}>
        ← Back to Dashboard
      </button>
      <h1>❓Tutorial</h1>
      <div className={styles.slideContainer}>
        <h2>{slides[currentSlide].title}</h2>
        <p>{renderContent(slides[currentSlide].content)}</p>
      </div>
      <div className={styles.navigation}>
        <button onClick={prevSlide} className={styles.navButton}>Previous</button>
        <span className={styles.slideIndicator}>{currentSlide + 1} / {slides.length}</span>
        <button onClick={nextSlide} className={styles.navButton}>Next</button>
      </div>
    </div>
  );
}