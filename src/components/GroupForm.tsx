
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGroups } from '@/contexts/groups';
import { useOrganizations } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Group, Organization } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GroupFormProps {
  group?: Group;
  onSuccess?: (groupId: string) => void;
  onClose?: () => void;
  organizationId?: string;
  members?: string[];
}

const GroupForm = ({ group, onSuccess, onClose, organizationId: initialOrgId, members: initialMembers }: GroupFormProps) => {
  const [searchParams] = useSearchParams();
  const orgIdParam = searchParams.get('organizationId');
  
  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [organizationId, setOrganizationId] = useState(group?.organizationId || initialOrgId || orgIdParam || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createGroup, updateGroup } = useGroups();
  const { organizations, getUserOrganizations } = useOrganizations();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const userOrganizations = getUserOrganizations();

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a group name');
      return;
    }

    if (!organizationId) {
      alert('Please select an organization');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (group) {
        // Update existing group
        await updateGroup(group.id, { name, description, organizationId });
        if (onSuccess) {
          onSuccess(group.id);
        } else {
          navigate(`/groups/${group.id}`);
        }
      } else {
        // Create new group
        const members = initialMembers || (currentUser ? [currentUser.id] : []);
        const groupId = await createGroup({
          name,
          description,
          organizationId,
          members
        });
        
        if (onSuccess) {
          onSuccess(groupId);
        } else {
          navigate(`/groups/${groupId}`);
        }
      }

      // Call onClose if provided
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <label htmlFor="organizationId" className="text-sm font-medium">
              Organization
            </label>
            <Select
              value={organizationId}
              onValueChange={setOrganizationId}
              required
              disabled={!!group || !!initialOrgId} // Disable changing organization for existing groups or when org is specified
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                {userOrganizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!userOrganizations.length && (
              <p className="text-sm text-destructive">
                You need to create or join an organization first.
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={() => navigate('/organizations/new')}
                >
                  Create an organization
                </Button>
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Song Set Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose ? onClose() : navigate('/groups')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !organizationId}>
              {isSubmitting
                ? 'Saving...'
                : group
                ? 'Update Group'
                : 'Create Group'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GroupForm;
