
import { useParams } from 'react-router-dom';
import OrganizationDetailComponent from '@/components/OrganizationDetail';

const OrganizationDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div>Invalid organization ID</div>;

  return <OrganizationDetailComponent id={id} />;
};

export default OrganizationDetailPage;
