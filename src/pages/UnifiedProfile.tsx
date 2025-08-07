import { useParams } from 'react-router-dom';
import ViewerProfile from '../components/profile/ViewerProfile';
import BackButton from '../components/BackButton';

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
      <ViewerProfile username={username} />
    </>
  );
};

export default UnifiedProfile;
