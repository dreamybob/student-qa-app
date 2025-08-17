import QuestionForm from '../components/questions/QuestionForm';
import type { QuestionFormData } from '../types';
import './QuestionPage.css';

interface QuestionPageProps {
  onSubmitQuestion: (questionData: QuestionFormData) => void;
  loading?: boolean;
}

const QuestionPage: React.FC<QuestionPageProps> = ({ onSubmitQuestion, loading = false }) => {
  return (
    <div className="question-page">
      <div className="question-container">
        <QuestionForm onSubmit={onSubmitQuestion} loading={loading} />
      </div>
    </div>
  );
};

export default QuestionPage;
