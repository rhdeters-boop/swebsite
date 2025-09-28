import { useParams } from 'react-router-dom';
import UserProfile from './account/UserProfile';
import BackButton from '../components/navigation/BackButton';

const UnifiedProfile = () => {
  const { username } = useParams<{ username: string }>();

  if (!username) {
    return (
      <div className="page-section">
        <BackButton />
        <div className="text-center py-12">
          <p className="text-text-muted">Username not found in URL</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <UserProfile username={username} />
    </>
  );
};

export default UnifiedProfile;
