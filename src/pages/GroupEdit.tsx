
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GroupForm from '@/components/GroupForm';
import { useGroups } from '@/contexts/groups';
import { useAuth } from '@/contexts/AuthContext';
import { Group } from '@/lib/types';

const GroupEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { getGroup } = useGroups();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | undefined>();

  useEffect(() => {
    if (id) {
      const groupData = getGroup(id);
      setGroup(groupData);
      
      if (!groupData) {
        navigate('/groups', { replace: true });
        return;
      }
      
      // Check if user has permission to edit
      if (
        currentUser && 
        currentUser.role !== 'admin' && 
        groupData.createdBy !== currentUser.id
      ) {
        navigate(`/groups/${id}`, { replace: true });
      }
    }
  }, [id, getGroup, navigate, currentUser]);

  if (!group) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Group</h1>
      <GroupForm 
        group={group} 
        onSuccess={() => navigate(`/groups/${id}`)} 
      />
    </div>
  );
};

export default GroupEdit;
