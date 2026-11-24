import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import CursosSection from '../components/CursosSection';
import ComoFunciona from '../components/ComoFunciona';
import AjudaSection from '../components/AjudaSection';
import Footer from '../components/Footer';
import SatisfactionSurvey from '../components/SatisfactionSurvey';
import { PublicCourse } from '../components/CourseCard';
import { usePublicCourses } from '../lib/usePublicCourses';
const CourseQuizModal = lazy(() => import('../components/CourseQuizModal'));

// Mobile-first home: photo, search, courses, how it works, help. One idea per section.
export default function Home() {
  const location = useLocation();
  const { courses, loading, error } = usePublicCourses<PublicCourse>();
  const [quizOpen, setQuizOpen] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [requestedCategory, setRequestedCategory] = useState<{ name: string; at: number } | null>(null);

  useEffect(() => {
    const section = location.state?.scrollTo;
    if (section) document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  }, [location.key]);

  return (
    <div className="course-home">
      <Header />
      <main>
        <Hero courses={courses} />
        <CursosSection courses={courses} loading={loading} error={error} requestedCategory={requestedCategory} />
        <ComoFunciona />
        <AjudaSection onOpenQuiz={() => setQuizOpen(true)} />
      </main>
      <Footer onOpenSurvey={() => setSurveyOpen(true)} />

      {quizOpen && (
        <Suspense fallback={null}>
          <CourseQuizModal isOpen={quizOpen} onClose={() => setQuizOpen(false)} onSelectCategory={name => setRequestedCategory({ name, at: Date.now() })} />
        </Suspense>
      )}
      <SatisfactionSurvey isOpen={surveyOpen} onClose={() => setSurveyOpen(false)} />
    </div>
  );
}
